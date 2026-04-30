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

type LoginUserInput = {
  email: string;
  name: string;
};

export const loginUser = async ({ email, name }: LoginUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const createdUser = await createUser({ email, name });

    return {
      user: createdUser,
      isNewUser: true,
    };
  }

  if (existingUser.name !== name) {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { name },
    });

    return {
      user: updatedUser,
      isNewUser: false,
    };
  }

  return {
    user: existingUser,
    isNewUser: false,
  };
};
