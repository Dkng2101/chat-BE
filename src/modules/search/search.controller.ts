import { Request, Response } from "express";
import { searchMessage } from "./services/search.service";

export const searchMessagesController = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;

    // console.log("q: ", q); 

    const messages = await searchMessage(q);

    // console.log("message: ", messages);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Search failed321" });
  }
};
