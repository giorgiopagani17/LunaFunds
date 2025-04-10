import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { CreateGroupTransactionDto } from './dto/create-groupTransaction.dto';
import axios from 'axios';
import { UpdateGroupTransactionDto } from './dto/update-groupTransaction.dto';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}
  private readonly apiUrl = 'https://api.currencybeacon.com/v1/latest';

  async getGroupsByUserId(userId: number) {
    try {
      const userGroups = await this.prisma.userGroup.findMany({
        where: { userId },
        select: { groupId: true },
      });

      const groupIds = userGroups.map((userGroup) => userGroup.groupId);

      const groups = await this.prisma.groups.findMany({
        where: { id: { in: groupIds } },
      });

      console.log('Fetched groups:', groups);
      return groups;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw new NotFoundException('Could not fetch groups for the user');
    }
  }

  async getUsersInfo(groupID: number, userId: number) {
    try {
      const userTransactions = await this.prisma.groupTransactions.findMany({
        where: { groupId: groupID, userId: userId },
      });

      const groupBalance = await this.prisma.groupTransactions.aggregate({
        _sum: {
          amount: true,
        },
        where: { groupId: groupID },
      });

      const numberUsers = await this.prisma.userGroup.count({
        where: { groupId: groupID },
      });

      const averageBalance = groupBalance._sum.amount / numberUsers;

      const userBalance = userTransactions.reduce((sum, transaction) => {
        return sum + transaction.amount;
      }, 0);

      return {
        userTransactions,
        groupBalance,
        averageBalance,
        userBalance,
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new NotFoundException('Could not fetch users for the group');
    }
  }

  async getUserGroups(groupId: number, userId: number) {
    console.log('Fetching users for group ID:', groupId);

    try {
      const group = await this.prisma.groups.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const groupUsers = await this.prisma.userGroup.findMany({
        where: { groupId },
        select: {
          userId: true,
          isBoss: true,
          payGroup: true,
        },
      });

      // Creiamo una mappa per associare `userId` ai record di `groupUsers`
      const userGroupMap = groupUsers.reduce((map, userGroup) => {
        map[userGroup.userId] = userGroup;
        return map;
      }, {});

      const userIds = groupUsers.map((userGroup) => userGroup.userId);

      const users = await this.prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, groupTransactions: true },
      });

      const result = users.map((user) => {
        const userGroup = userGroupMap[user.id]; // Recuperiamo i dettagli da `userGroupMap`

        const totalAmount = user.groupTransactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0,
        );

        return {
          id: user.id,
          name: user.name,
          isBoss: userGroup?.isBoss, // Dettagli dal mapping
          payGroup: userGroup?.payGroup, // Dettagli dal mapping
          totalAmount: totalAmount,
          isMine: user.id === userId, // Verifica se l'utente corrente è "mio"
        };
      });

      console.log('Fetched users:', result);
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new NotFoundException('Could not fetch users for the group');
    }
  }

  async getGroupName(groupId: number, userId: number) {
    try {
      // Check if the user is part of the group
      const userGroup = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroup) {
        throw new ForbiddenException('User is not part of the group');
      }

      // Fetch the group name
      const group = await this.prisma.groups.findUnique({
        where: { id: groupId },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      return group.name;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error fetching group name: ' + error.message,
      );
    }
  }

  formatUserName = (name: string): string => {
    const [firstName, lastName] = name.split(' ');
    const lastNameInitial = lastName ? `${lastName.charAt(0)}.` : '';
    return `${firstName} ${lastNameInitial}`;
  };

  async setUserPayGroup(groupId: number, userId: number) {
    const group = await this.prisma.groups.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const setPayGroup = await this.prisma.userGroup.update({
      where: { userId_groupId: { userId, groupId } },
      data: {
        payGroup: true,
      },
    });

    const usersInGroup = await this.prisma.userGroup.findMany({
      where: { groupId },
      select: { payGroup: true, userId: true, isBoss: true },
    });

    if (usersInGroup.every((user) => user.payGroup)) {
      const totalAmount = await this.prisma.groupTransactions.aggregate({
        _sum: {
          amount: true,
        },
        where: { groupId },
      });

      const averageAmount = totalAmount._sum.amount / usersInGroup.length;

      return await this.payGroup(usersInGroup, averageAmount, groupId);
    }
    return setPayGroup;
  }

  async payGroup(usersInGroup, averageAmount, groupId) {
    try {
      for (const user of usersInGroup) {
        const totalAmount = await this.prisma.groupTransactions.aggregate({
          _sum: {
            amount: true,
          },
          where: { groupId, userId: user.userId },
        });

        const accountDefault = await this.prisma.accounts.findFirst({
          where: { userId: user.userId, default: true },
          select: { id: true },
        });

        const userInfo = await this.prisma.users.findFirst({
          where: { id: user.userId },
          select: { currency: true, name: true },
        });

        const categoryGroup = await this.prisma.categories.findFirst({
          where: { userId: user.userId, name: 'Group' },
          select: { id: true },
        });

        if (!accountDefault || !categoryGroup) {
          throw new NotFoundException('Account or category group not found');
        }

        user.difference = parseFloat(
          (averageAmount - totalAmount._sum.amount).toFixed(2),
        );
        user.accountDefault = accountDefault.id;
        user.categoryGroup = categoryGroup.id;
        user.currency = userInfo.currency;
        user.name = userInfo.name;
      }

      console.log(usersInGroup);

      const group = await this.prisma.groups.findFirst({
        where: { id: groupId },
        select: { currency: true, name: true },
      });

      const userBoss = usersInGroup.find((user) => user.isBoss);

      console.log(userBoss);
      while (usersInGroup.some((user) => user.difference !== 0)) {
        for (const user of usersInGroup) {
          if (user.difference < 0) {
            const userWithPositiveDifference = usersInGroup.find(
              (u) => u.difference > 0,
            );

            let senderAmount: number;
            let receiverAmount: number;

            try {
              senderAmount = await this.convertCurrency(
                user.difference,
                group.currency,
                user.currency,
              );
            } catch (error) {
              console.error('Error converting currency:', error.message);
              senderAmount = user.difference;
            }

            try {
              receiverAmount = await this.convertCurrency(
                user.difference,
                group.currency,
                userWithPositiveDifference.currency,
              );
            } catch (error) {
              console.error('Error converting currency:', error.message);
              receiverAmount = user.difference;
            }

            const receiverTransaction = await this.prisma.transactions.create({
              data: {
                userId: userWithPositiveDifference.userId,
                accountId: userWithPositiveDifference.accountDefault,
                categoryId: userWithPositiveDifference.categoryGroup,
                amount: Math.abs(receiverAmount),
                name: `Group Payment From ${this.formatUserName(user.name)}`,
                createdAt: new Date(),
                bankTransfer: null,
              },
            });

            const senderTransaction = await this.prisma.transactions.create({
              data: {
                userId: user.userId,
                accountId: user.accountDefault,
                categoryId: user.categoryGroup,
                amount: senderAmount,
                name: `Group Payment To ${this.formatUserName(userWithPositiveDifference.name)}`,
                createdAt: new Date(),
                bankTransfer: receiverTransaction.id,
              },
            });

            await this.prisma.transactions.update({
              where: { id: receiverTransaction.id },
              data: { bankTransfer: senderTransaction.id },
            });

            await this.prisma.notifications.create({
              data: {
                toUserId: user.userId,
                message: `You paid ${Math.abs(user.difference.toFixed(2))}${user.currency} to ${userWithPositiveDifference.name} for adjusting the group ${group.name} balance`,
                fromUserId: userWithPositiveDifference.userId,
              },
            });

            await this.prisma.notifications.create({
              data: {
                toUserId: userWithPositiveDifference.userId,
                message: `You receive ${Math.abs(user.difference.toFixed(2))}${userWithPositiveDifference.currency} from ${user.name} for adjusting the group ${group.name} balance`,
                fromUserId: user.userId,
              },
            });

            if (
              userWithPositiveDifference.difference >= Math.abs(user.difference)
            ) {
              userWithPositiveDifference.difference -= Math.abs(
                user.difference,
              );
              user.difference = 0;
            } else {
              user.difference += userWithPositiveDifference.difference;
              userWithPositiveDifference.difference = 0;
            }
          }
        }

        await this.removeGroup(groupId, userBoss.userId);

        return 'deletedGroup';
      }
    } catch (error) {
      console.error('Error paying the group:', error);
      throw new NotFoundException('Could not pay the group');
    }
  }

  async leaveGroup(groupId: number, userId: number) {
    try {
      // Check if the user is a boss in the group
      const userGroup = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (userGroup?.isBoss) {
        const oldestUser = await this.prisma.userGroup.findFirst({
          where: { groupId },
          orderBy: { createdAt: 'asc' },
        });

        if (oldestUser) {
          await this.prisma.userGroup.update({
            where: { userId_groupId: { userId: oldestUser.userId, groupId } },
            data: { isBoss: true },
          });
        }
      }

      const userGroupRecord = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroupRecord) {
        throw new NotFoundException(
          `User group with userId ${userId} and groupId ${groupId} not found`,
        );
      }

      // Delete all transactions related to the user in the specified group
      await this.prisma.groupTransactions.deleteMany({
        where: { groupId, userId },
      });

      // Delete the user from the group
      return await this.prisma.userGroup.delete({
        where: { userId_groupId: { userId, groupId } },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error deleting user group: ' + error.message,
      );
    }
  }

  async removeUserGroup(groupId: number, userId: number, myUserId: number) {
    try {
      // Check if the user is a boss in the group
      const userGroup = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId: myUserId, groupId } },
      });

      if (!userGroup?.isBoss) {
        throw new NotFoundException(`You are not the boss of the group`);
      }

      const userGroupRecord = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroupRecord) {
        throw new NotFoundException(
          `User group with userId ${userId} and groupId ${groupId} not found`,
        );
      }

      // Delete all transactions related to the user in the specified group
      await this.prisma.groupTransactions.deleteMany({
        where: { groupId, userId },
      });

      // Delete the user from the group
      return await this.prisma.userGroup.delete({
        where: { userId_groupId: { userId, groupId } },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error deleting user group: ' + error.message,
      );
    }
  }

  async removeGroup(groupId: number, userId: number) {
    try {
      // Check if the user is a boss in the group
      const userGroup = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroup?.isBoss) {
        throw new NotFoundException(`You are not the boss of the group`);
      }

      const userGroupRecord = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroupRecord) {
        throw new NotFoundException(
          `User group with userId ${userId} and groupId ${groupId} not found`,
        );
      }

      // Delete all transactions related to the user in the specified group
      await this.prisma.groupTransactions.deleteMany({
        where: { groupId },
      });

      // Delete the user from the group
      await this.prisma.userGroup.deleteMany({
        where: { groupId },
      });

      await this.prisma.groups.delete({
        where: { id: groupId },
      });

      const group = await this.prisma.groups.findUnique({
        where: { id: userId },
      });

      if (!group) {
        return '00000';
      }

      return group;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error deleting user group: ' + error.message,
      );
    }
  }

  async setBossUserGroup(groupId: number, userId: number, myUserId: number) {
    try {
      // Check if the user is a boss in the group
      const userGroup = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId: myUserId, groupId } },
      });

      if (!userGroup?.isBoss) {
        throw new NotFoundException(`You are not the boss of the group`);
      }

      const userGroupRecord = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroupRecord) {
        throw new NotFoundException(
          `User group with userId ${userId} and groupId ${groupId} not found`,
        );
      }

      await this.prisma.userGroup.update({
        where: { userId_groupId: { userId: myUserId, groupId } },
        data: { isBoss: false },
      });

      // Delete the user from the group
      return await this.prisma.userGroup.update({
        where: { userId_groupId: { userId, groupId } },
        data: { isBoss: true },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error updating user group: ' + error.message,
      );
    }
  }

  async updateGroupName(
    groupId: number,
    updateGroupDto: CreateGroupDto,
    userId: number,
  ) {
    try {
      // Check if the user is a boss in the group
      const userGroup = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroup?.isBoss) {
        throw new NotFoundException(`You are not the boss of the group`);
      }

      return await this.prisma.groups.update({
        where: { id: groupId },
        data: { name: updateGroupDto.name },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error updating user group: ' + error.message,
      );
    }
  }

  async createGroupTransaction(
    createGroupTransactionDto: CreateGroupTransactionDto,
  ) {
    try {
      // Fetch the group's currency
      const group = await this.prisma.groups.findUnique({
        where: { id: createGroupTransactionDto.groupId },
        select: { currency: true, name: true },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      // Fetch the user's currency
      const user = await this.prisma.users.findUnique({
        where: { id: createGroupTransactionDto.userId },
        select: { currency: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if the accountId exists
      const account = await this.prisma.accounts.findUnique({
        where: { id: createGroupTransactionDto.accountId },
      });

      console.log(account);
      console.log(group);
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      let convertedAmount: number;
      try {
        convertedAmount = await this.convertCurrency(
          createGroupTransactionDto.amount,
          group.currency,
          user.currency,
        );
      } catch (error) {
        console.error('Error converting currency:', error.message);
        convertedAmount = createGroupTransactionDto.amount;
      }

      console.log('Converted amount:', convertedAmount);

      const groupCategory = await this.prisma.categories.findFirst({
        where: { name: 'Group', userId: createGroupTransactionDto.userId },
      });

      const transaction = await this.prisma.transactions.create({
        data: {
          name: group.name + ' - ' + createGroupTransactionDto.name,
          amount: -convertedAmount,
          createdAt: createGroupTransactionDto.createdAt,
          userId: createGroupTransactionDto.userId,
          accountId: createGroupTransactionDto.accountId,
          categoryId: groupCategory.id,
        },
      });

      return await this.prisma.groupTransactions.create({
        data: {
          name: createGroupTransactionDto.name,
          amount: -createGroupTransactionDto.amount,
          createdAt: createGroupTransactionDto.createdAt,
          userId: createGroupTransactionDto.userId,
          groupId: createGroupTransactionDto.groupId,
          transactionId: transaction.id,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error creating transaction: ' + error.message,
      );
    }
  }

  async deleteGroupTransaction(transactionId: number, userId: number) {
    try {
      const groupTransaction = await this.prisma.groupTransactions.findUnique({
        where: { id: transactionId },
        select: { userId: true, groupId: true, transactionId: true },
      });

      if (groupTransaction?.userId !== userId) {
        throw new ForbiddenException(
          'You are not allowed to delete this transaction',
        );
      }

      await this.prisma.transactions.delete({
        where: { id: groupTransaction.transactionId },
      });

      return await this.prisma.groupTransactions.delete({
        where: { id: transactionId },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error deleting transaction: ' + error.message,
      );
    }
  }

  async updateGroupTransaction(
    updateGroupTransactionDto: UpdateGroupTransactionDto,
    transactionId: number,
  ) {
    try {
      const groupTransaction = await this.prisma.groupTransactions.findUnique({
        where: { id: transactionId },
        select: { userId: true, groupId: true, transactionId: true },
      });

      if (groupTransaction?.userId !== updateGroupTransactionDto.userId) {
        throw new ForbiddenException(
          'You are not allowed to update this transaction',
        );
      }

      const group = await this.prisma.groups.findUnique({
        where: { id: groupTransaction.groupId },
        select: { currency: true, name: true },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      const user = await this.prisma.users.findUnique({
        where: { id: updateGroupTransactionDto.userId },
        select: { currency: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let convertedAmount: number;
      try {
        convertedAmount = await this.convertCurrency(
          updateGroupTransactionDto.amount,
          group.currency,
          user.currency,
        );
      } catch (error) {
        console.error('Error converting currency:', error.message);
        convertedAmount = updateGroupTransactionDto.amount;
      }

      const transaction = await this.prisma.transactions.update({
        where: { id: groupTransaction.transactionId },
        data: {
          name: group.name + ' - ' + updateGroupTransactionDto.name,
          amount: -convertedAmount,
          createdAt: updateGroupTransactionDto.createdAt,
          userId: updateGroupTransactionDto.userId,
        },
      });

      return await this.prisma.groupTransactions.update({
        where: { id: transactionId },
        data: {
          name: updateGroupTransactionDto.name,
          amount: -updateGroupTransactionDto.amount,
          createdAt: updateGroupTransactionDto.createdAt,
          userId: updateGroupTransactionDto.userId,
          groupId: groupTransaction.groupId,
          transactionId: transaction.id,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Error updating transaction: ' + error.message,
      );
    }
  }

  async createGroup(createGroupDto: CreateGroupDto) {
    try {
      const userGroupsCount = await this.prisma.userGroup.count({
        where: { userId: createGroupDto.userId },
      });

      if (userGroupsCount >= 3) {
        throw new BadRequestException('User cannot create more than 3 groups');
      }

      // Fetch the group's currency
      const group = await this.prisma.groups.create({
        data: { name: createGroupDto.name, currency: createGroupDto.currency },
      });

      const blueShade = Math.floor(Math.random() * 156 + 100)
        .toString(16)
        .padStart(2, '0');
      const color = `#0000${blueShade}`;

      // Fetch the user's currency
      await this.prisma.userGroup.create({
        data: {
          userId: createGroupDto.userId,
          groupId: group.id,
          color: color,
          isBoss: true,
        },
      });

      return group;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Error creating group: ' + error.message);
    }
  }

  async inviteUsersToGroup(userId: number, users: any, groupId: number) {
    try {
      if (!Array.isArray(users)) {
        throw new BadRequestException('Users must be an array');
      }

      // Convert all elements to numbers if they are not already
      const userNumbers = users.map((user) => {
        const userNumber = parseInt(user, 10);
        if (isNaN(userNumber)) {
          throw new BadRequestException('All user IDs must be valid numbers');
        }
        return userNumber;
      });

      const userGroup = await this.prisma.userGroup.findUnique({
        where: { userId_groupId: { userId, groupId } },
      });

      if (!userGroup?.isBoss) {
        throw new ForbiddenException('You are not the boss of the group');
      }

      const group = await this.prisma.groups.findUnique({
        where: { id: groupId },
        select: { name: true },
      });

      await this.prisma.notifications.createMany({
        data: userNumbers.map((userId) => ({
          toUserId: userId,
          message: `You have been invited to join group ${group.name}`,
          fromGroupId: groupId,
          fromUserId: userId,
        })),
      });

      return true;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Notification with the same properties already exists.',
        );
      }
      throw new BadRequestException(
        'Error creating Notification: ' + error.message,
      );
    }
  }

  async joinGroup(userId: number, groupId: number, notificationId: number) {
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

      const getRandomColorComponent = () => Math.floor(Math.random() * 200); // Limit to 200 to avoid light colors
      const color = `#${getRandomColorComponent().toString(16).padStart(2, '0')}${getRandomColorComponent().toString(16).padStart(2, '0')}${getRandomColorComponent().toString(16).padStart(2, '0')}`;

      await this.prisma.userGroup.create({
        data: {
          userId: userId,
          groupId: groupId,
          color: color,
          isBoss: false,
        },
      });

      return true;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'User in group with the same properties already exists.',
        );
      }
      throw new BadRequestException(
        'Error creating user in group: ' + error.message,
      );
    }
  }

  private mapCurrencySymbolToCode(symbol: string): string {
    const currencyMap: { [key: string]: string } = {
      '€': 'EUR',
      $: 'USD',
      '£': 'GBP',
    };

    return currencyMap[symbol] || symbol;
  }

  private async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    try {
      // Map currency symbols to currency codes
      const fromCurrencyCode = this.mapCurrencySymbolToCode(fromCurrency);
      const toCurrencyCode = this.mapCurrencySymbolToCode(toCurrency);

      const response = await axios.get(this.apiUrl, {
        params: {
          api_key: process.env.CURRENCYBEACON_API_KEY,
        },
      });

      if (response.data) {
        const rates = response.data.rates;
        const fromRate = rates[fromCurrencyCode];
        const toRate = rates[toCurrencyCode];

        if (!fromRate || !toRate) {
          throw new Error('Currency rate not found');
        }

        const convertedAmount = (amount / fromRate) * toRate;

        return parseFloat(convertedAmount.toFixed(2));
      } else {
        throw new Error('Currency conversion failed');
      }
    } catch (error) {
      console.error('Error converting currency:', error.message);
      throw new BadRequestException('Error converting currency');
    }
  }
}
