import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { createUser, getUsers } from "./services/user.service";

export const createUserController = async (req: Request, res: Response) => {
  const { name, email } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({
      error: "name and email are required",
    });
  }

  try {
    const user = await createUser({ name, email });

    return res.status(201).json({ data: user });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "email already exists",
      });
    }

    console.error("Failed to create user:", error);
    return res.status(500).json({ error: "Failed to create user" });
  }
};

export const getUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();

    return res.json({ data: users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};
