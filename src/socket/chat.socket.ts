import { Server, Socket } from "socket.io";
import { createMessage } from "../modules/message/services/message.service";
import { saveMessageWithEmbedding } from "../modules/ai/services/ai.embed.service";
export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);

    console.log(`joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const message = await saveMessageWithEmbedding(data);

    console.log("message send: ", message);

    io.to(data.conversationId).emit("receive_message", message);
  });
};
