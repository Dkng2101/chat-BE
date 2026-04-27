import OpenAI from "openai";
import { prisma } from "../../../db/prisma";
import { create } from "node:domain";

const embeddingClient = new OpenAI({
  apiKey: "ollama",
  baseURL: "http://localhost:11434/v1",
});

export async function createEmbedding(text: string) {
  const res = await embeddingClient.embeddings.create({
    model: "nomic-embed-text-v2-moe",
    input: text,
  });

  return res.data[0].embedding;
}

export async function saveMessageWithEmbedding(message: {
  text: string;
  senderId: string;
  conversationId: string;
  type: "TEXT" | "AI";
}) {
  const embedding = await createEmbedding(message.text);

  // console.log("embedding: ", embedding);
  const id = crypto.randomUUID();

  await prisma.$executeRaw`
    INSERT INTO "Message"
    (id, text, "senderId", "conversationId", type, embedding)
    VALUES (
      ${id},
      ${message.text},
      ${message.senderId},
      ${message.conversationId},
      ${message.type}::"MessageType",
      ${embedding}::vector
    )
  `;

  return {
    id,
    ...message,
    createdAt: new Date(),
  };
}
