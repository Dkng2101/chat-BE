import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerChatHandlers } from "./socket/chat.socket";
import listEndpoints from "express-list-endpoints";
import searchRoutes from "./modules/search/search.routes";
import messageRoutes from "./modules/message/message.routes";
import { socketHandlers } from "./socket/socket.handler";

const app = express();

app.use(cors());
app.use(express.json());

// REST API routes

app.use("/api/messages", messageRoutes);
app.use("/api/search", searchRoutes);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  registerChatHandlers(io, socket);

  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
  });

  socketHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = 4000;

httpServer.listen(PORT, () => {
  console.log(`socket server running ${PORT}`);

  console.log("\n📌 Registered API routes:");
  console.log(listEndpoints(app));
});
