import { Server, Socket } from "socket.io";
import { aiConversation } from "../modules/ai/services/ai.service";

export const socketHandlers = (io: Server, socket: Socket) => {

    socket.on("send_message", async (data) => {

        const { text, conversationId } = data;

        // console.log("message send: ", data);

        if (text.trim().toLowerCase().startsWith("@ai")) {

            try {
                const mode = text.trim().toLowerCase().startsWith("@ai summarize")
                    ? "summarize"
                    : "explain";

                const stream = await aiConversation(data, mode);

                let fullText = "";

                const messageId = "ai-" + Date.now();


                for await (const part of stream) {
                    const token = part.choices?.[0]?.delta?.content ?? "";

                    if (!token) continue;

                    fullText += token;

                    // allMessage += part.choices?.[0]?.delta?.content ?? "";
                    io.to(conversationId).emit("ai_stream", {
                        id: messageId,
                        text: fullText,
                        sender: "AI"
                    });
                }

            } catch (error) {
                console.error("AI error: ", error);
                socket.emit("ai_stream", {
                    id: "ai-error-" + Date.now(),
                    text: "AI failed to summarize",
                    sender: "AI",
                });
            }

            return;
        }

        // message bình thường
        // io.to(conversationId).emit("receive_message", data);

    });

};