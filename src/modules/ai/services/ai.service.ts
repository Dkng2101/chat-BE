import OpenAI from "openai";
import { getRecentMessages } from "../../message/services/message.service";
import { prisma } from "../../../db/prisma";
import { createEmbedding, saveMessageWithEmbedding } from "./ai.embed.service";

// const client = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY
// });
// ussing groq api key for testing, because openai key is paywalled and
// I want to test the summarize function without worrying about cost.
// Groq provides a free tier with a generous quota,
//  so it's great for development and testing purposes.
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const llamaClient = new OpenAI({
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
});

export type AiMode = "summarize" | "explain";

export const aiConversation = async (data: any, mode: AiMode) => {
  const { conversationId, senderId, type, text } = data;

  try {
    let stream;

    if (mode === "summarize") {
      const messages = await getRecentMessages(conversationId);

      const textContext = messages
        .map((m: any) => `${m.senderId}: ${m.text}`)
        .join("\n");

      stream = await llamaClient.chat.completions.create({
        model: "llama3",
        messages: [
          {
            role: "system",
            content: "Bạn là AI giúp tóm tắt cuộc trò chuyện.",
          },
          {
            role: "user",
            content: `Tóm tắt cuộc trò chuyện:\n${textContext}`,
          },
        ],
        stream: true,
      });
    } else {
      // 🔥 RAG SEARCH
      const relatedMessages = await searchSimilarMessages(text, conversationId);

      const context = relatedMessages.map((m: any) => m.text).join("\n");

      stream = await llamaClient.chat.completions.create({
        model: "llama3",
        messages: [
          {
            role: "system",
            content: `
                    Bạn là AI trả lời câu hỏi dựa trên context được cung cấp và hãy trả lời lại bằng tiếng Việt.
                    Nếu không có thông tin thì nói không biết.
`,
          },
          {
            role: "user",
            content: `
                Context:
                ${context}
                        
                Question:
                ${text}
                `,
          },
        ],
        stream: true,
      });
    }

    const [streamRealtime, streamClient] = stream.tee();

    let fullText = "";

    for await (const chunk of streamClient) {
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) fullText += token;
    }

    // Save AI message
    await saveMessageWithEmbedding({
      text: fullText,
      senderId,
      conversationId,
      type,
    });

    return streamRealtime;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// export const aiConversation = async (
//     data: any,
//     mode: AiMode
// ) => {
//     const { conversationId, senderId, type, text } = data;

//     try {
//         let stream;
//         // CASE 1: SUMMARIZE
//         if (mode === "summarize") {
//             const messages = await getRecentMessages(conversationId);

//             const textContext = messages
//                 .map((m: any) => `${m.senderId}: ${m.text}`)
//                 .join("\n");

//             stream = await groqClient.chat.completions.create({
//                 model: "llama-3.1-8b-instant",
//                 messages: [
//                     {
//                         role: "system",
//                         content: "Bạn là AI giúp tóm tắt cuộc trò chuyện ngắn gọn."
//                     },
//                     {
//                         role: "user",
//                         content: `Hãy tóm tắt nội dung cuộc trò chuyện sau:\n${textContext}`
//                     }
//                 ],
//                 stream: true
//             });
//         }

//         // CASE 2: EXPLAIN MESSAGE
//         else {
//             stream = await groqClient.chat.completions.create({
//                 model: "llama-3.1-8b-instant", //llama3 //llama3-8b-8192
//                 messages: [
//                     {
//                         role: "system",
//                         content: "Bạn là AI trả lời câu hỏi cho người dùng."
//                     },
//                     {
//                         role: "user",
//                         content: `
//                     Hãy trả lời câu hỏi của tin nhắn sau:
//                     "${text}"
//                     `
//                     }
//                 ],
//                 stream: true
//             });

//             // const allMessage = response.choices?.[0]?.message?.content ?? "";

//             // await prisma.message.create({
//             //     data: {
//             //         text: allMessage,
//             //         senderId,
//             //         conversationId,
//             //         type
//             //     }
//             // });

//             // return response;
//         }

//         const [streamRealtime, streamClient] = stream.tee();

//         // For streaming case, collect chunks
//         let fullText = "";

//         for await (const chunk of streamClient) {
//             const token = chunk.choices?.[0]?.delta?.content;
//             if (token) {
//                 fullText += token;
//             }
//         }

//         // const aiText =
//         //     response.choices?.[0]?.message?.content ?? "No response";

//         await prisma.message.create({
//             data: {
//                 text: fullText,
//                 senderId,
//                 conversationId,
//                 type
//             }
//         });

//         return streamRealtime;

//         // console.log('aiText: ', JSON.stringify(aiText));

//         // return aiText;

//     } catch (error: any) {
//         console.error(error);
//         throw error;
//     }
// };

export async function searchSimilarMessages(
  question: string,
  conversationId: string,
) {
  const embedding = await createEmbedding(question);

  const result = await prisma.$queryRaw<any[]>`
    SELECT id, text
    FROM "Message"
    WHERE "conversationId" = ${conversationId}
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT 5
  `;

  return result;
}
