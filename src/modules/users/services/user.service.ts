import { randomUUID } from "crypto";
import { prisma } from "../../../db/prisma";

type CreateUserInput = {
  name: string;
  email: string;
};

export const createUser = async ({ name, email }: CreateUserInput) => {
  return prisma.user.create({
    data: {
      id: randomUUID(),
      name,
      email,
    },
  });
};

export const getUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};
