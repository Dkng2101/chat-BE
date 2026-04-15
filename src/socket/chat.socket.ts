import { Server, Socket } from "socket.io";
import { createMessage } from "../modules/message/services/message.service";
export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);

    console.log(`joined room ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    const message = await createMessage(data);

    console.log("message send: ", message);

    io.to(data.conversationId).emit("receive_message", message);
  });
};
