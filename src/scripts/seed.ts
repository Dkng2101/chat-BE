import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: "User A",
      email: "a@gmail.com",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "User B",
      email: "b@gmail.com",
    },
  });

  // const conversation = await prisma.conversation.create({
  //   data: {
  //     id: "1",
  //     created: new Date(),
  //   },
  // });

  console.log(user1, user2);
}

main();
