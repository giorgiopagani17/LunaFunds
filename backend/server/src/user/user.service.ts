import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReadNotificationsDto } from './dto/read-notifications.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUserInfo(userId: number) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id: userId,
        },
        select: {
          email: true,
          name: true,
          currency: true,
          createdAt: true,
          accounts: {
            select: {
              id: true,
              name: true,
              default: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const totalTransactions = await this.prisma.transactions.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: userId,
        },
      });

      const defaultAccount = user.accounts.find((account) => account.default);
      const numberOfAccounts = user.accounts.length;

      return {
        ...user,
        defaultAccount,
        totalTransactions: totalTransactions._sum.amount || 0,
        numberOfAccounts,
      };
    } catch (error) {
      throw new BadRequestException('Failed to get user info', error);
    }
  }

  async getUserNotifications(userId: number) {
    try {
      const notifications = await this.prisma.notifications.findMany({
        where: {
          toUserId: userId,
          read: false,
        },
        select: {
          id: true,
          message: true,
          createdAt: true,
          read: true,
          groups: {
            select: {
              name: true,
              id: true,
            },
          },
          fromUsers: {
            select: {
              name: true,
            },
          },
        },
      });

      if (notifications.length > 0) {
        return notifications;
      }

      return await this.prisma.notifications.findMany({
        where: {
          toUserId: userId,
          read: true,
        },
        select: {
          id: true,
          message: true,
          createdAt: true,
          read: true,
          groups: {
            select: {
              name: true,
              id: true,
            },
          },
          fromUsers: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      });
    } catch (error) {
      throw new BadRequestException('Failed to get user notifications', error);
    }
  }

  async getUserToInvite(userId: number, searchQuery: string, groupID: number) {
    try {
      const users = await this.prisma.users.findMany({
        where: {
          id: {
            not: userId,
          },
          OR: [
            {
              email: {
                contains: searchQuery,
              },
            },
            {
              name: {
                contains: searchQuery,
              },
            },
          ],
          userGroup: {
            none: {
              groupId: groupID,
            },
          },
        },
        select: {
          email: true,
          name: true,
          id: true,
        },
      });

      if (users.length === 0) {
        return [];
      }

      return await Promise.all(
        users.map(async (user) => {
          const notification = await this.prisma.notifications.findFirst({
            where: {
              toUserId: user.id,
              fromGroupId: groupID,
              read: false,
            },
          });

          return {
            ...user,
            selected: false,
            invited: !!notification,
          };
        }),
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new BadRequestException('Failed to get users');
    }
  }

  async readNotification(
    userId: number,
    readNotificationsDto: ReadNotificationsDto,
  ) {
    try {
      const { notificationIDs } = readNotificationsDto;

      if (!Array.isArray(notificationIDs)) {
        throw new BadRequestException('notificationIDs must be an array');
      }

      await this.prisma.notifications.updateMany({
        where: {
          id: {
            in: notificationIDs,
          },
          toUserId: userId,
        },
        data: {
          read: true,
        },
      });

      return { message: 'Notifications marked as read' };
    } catch (error) {
      throw new BadRequestException(
        'Failed to mark notifications as read',
        error,
      );
    }
  }

  async countUnreadNotifications(userId: number) {
    try {
      const count = await this.prisma.notifications.count({
        where: {
          toUserId: userId,
          read: false,
        },
      });

      return count;
    } catch (error) {
      throw new BadRequestException(
        'Failed to count unread notifications',
        error,
      );
    }
  }

  async declineNotification(userId: number, notificationId: number) {
    try {
      const invite = await this.prisma.notifications.findUnique({
        where: { id: notificationId, toUserId: userId },
      });

      if (!invite) {
        throw new ForbiddenException('You are not invited in this group');
      }

      await this.prisma.notifications.delete({
        where: { id: notificationId },
      });

      return true;
    } catch (error) {
      throw new BadRequestException(
        'Failed to decline notification',
        error.message,
      );
    }
  }

  async deleteUser(userId: number) {
    try {
      await this.prisma.transactions.deleteMany({
        where: { userId },
      });

      await this.prisma.categories.deleteMany({
        where: { userId },
      });

      await this.prisma.groupTransactions.deleteMany({
        where: { userId },
      });

      await this.prisma.goals.deleteMany({
        where: { userId },
      });

      await this.prisma.budgets.deleteMany({
        where: { userId },
      });

      const groupsWhereUserIsBoss = await this.prisma.userGroup.findMany({
        where: { userId, isBoss: true },
        select: { groupId: true },
      });

      for (const group of groupsWhereUserIsBoss) {
        const oldestUser = await this.prisma.userGroup.findFirst({
          where: { groupId: group.groupId, userId: { not: userId } },
          orderBy: { createdAt: 'asc' },
        });

        if (oldestUser) {
          await this.prisma.userGroup.update({
            where: {
              userId_groupId: {
                userId: oldestUser.userId,
                groupId: group.groupId,
              },
            },
            data: { isBoss: true },
          });
        }
      }

      await this.prisma.userGroup.deleteMany({
        where: { userId },
      });

      await this.prisma.userGroup.deleteMany({
        where: { userId },
      });

      await this.prisma.stocks.deleteMany({
        where: { userId },
      });

      await this.prisma.notifications.deleteMany({
        where: { toUserId: userId },
      });

      await this.prisma.accounts.deleteMany({
        where: { userId },
      });

      await this.prisma.users.delete({
        where: { id: userId },
      });

      return true;
    } catch (error) {
      throw new BadRequestException('Failed to delete user', error);
    }
  }

  async updateUserDetails(updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          id: updateUserDto.id,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.users.update({
        where: { id: updateUserDto.id },
        data: {
          ...updateUserDto,
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      throw new BadRequestException('Failed to update user', error);
    }
  }

  async updateUserPassword(userId: number, newPassword: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from the old password',
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.users.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      if (
        error instanceof BadRequestException &&
        error.message.includes(
          'New password must be different from the old password',
        )
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update user password', error);
    }
  }
}
