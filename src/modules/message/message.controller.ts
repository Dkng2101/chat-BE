import { getMessages } from "./services/message.service";
import { Request, Response } from "express";

export const messageController = async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const take = parseInt(req.query.take as string) || 10;
  const cursor = req.query.cursor as string | undefined;

  try {
    const messages = await getMessages(conversationId, take, cursor);
    console.log("messages: ", messages);
    
    res.json({ data: messages });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
