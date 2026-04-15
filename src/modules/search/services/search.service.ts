import { prisma } from "../../../db/prisma";

export const searchMessage = async (q: string) => {
  console.log('q: ', q);

  if (!q?.trim()) {
    return prisma.message.findMany({
      include: { sender: true, conversation: true },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
  }

  // 1. Tìm message khớp với từ khóa (lấy cái cũ nhất)
  const matched = await prisma.message.findFirst({
    where: {
      text: {
        contains: q.trim(),
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!matched) return [];

  // 2. Lấy tất cả messages từ thời điểm đó trở về sau
  return prisma.message.findMany({
    where: {
      createdAt: {
        gte: matched.createdAt, // >= thời điểm của message tìm được
      },
    },
    include: { sender: true, conversation: true },
    orderBy: { createdAt: "asc" },
    take: 20,
  });
};