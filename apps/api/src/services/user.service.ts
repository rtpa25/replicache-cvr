import { prismaClient } from "@repo/models";

class UserService {
  async createUser(email: string) {
    return prismaClient.user.create({
      data: {
        email,
      },
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
