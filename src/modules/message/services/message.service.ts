import { randomUUID } from "crypto";
import { prisma } from "../../../db/prisma";

export const createMessage = async (data: any) => {
  console.log("Creating message with data: ", data);
  const message = await prisma.message.create({
    data: {
      id: randomUUID().toString(),
      text: data.text,
      senderId: data.senderId,
      conversationId: data.conversationId.toString(),
      type: data.type || "text",
    },
  });

  return message;
};

export const getMessages = async (conversationId: string) => {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: {
      sender: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  return messages.reverse();
};

export const getRecentMessages = async (conversationId: string) => {

  return prisma.message.findMany({

    where: { conversationId },

    orderBy: {
      createdAt: "desc"
    },

    take: 20

  });

};
