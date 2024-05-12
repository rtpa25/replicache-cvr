import { prismaClient } from "@repo/models";

class UserService {
  async upsertUser(email: string) {
    return prismaClient.user.upsert({
      where: {
        email,
      },
      create: {
        email,
      },
      update: {},
      select: {
        id: true,
      },
    });
  }

  async deleteUser(id: string) {
    return prismaClient.user.delete({
      where: {
        id,
      },
    });
  }
}

export const userService = new UserService();
