import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async getAccountsByUserId(userId: number) {
    console.log('Fetching accounts and total amounts for user ID:', userId);

    try {
      const accounts = await this.prisma.accounts.findMany({
        where: { userId },
        include: { transactions: true },
      });

      const result = accounts.map((account) => {
        const totalAmount = account.transactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0,
        );
        return {
          id: account.id,
          name: account.name,
          totalAmount: totalAmount,
          default: account.default,
        };
      });

      console.log('Fetched accounts:', result);
      return result;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new NotFoundException('Could not fetch accounts for the user');
    }
  }

  async getAccountsById(userId: number, accountId: number) {
    console.log('Fetching accounts and total amounts for ID:', accountId);

    try {
      const account = await this.prisma.accounts.findUnique({
        where: { id: accountId },
      });

      const user = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { currency: true },
      });

      return { account, userCurrency: user?.currency };
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw new NotFoundException('Could not fetch accounts for the user');
    }
  }

  async getAccountCreationDate(userId: number, accountId: number) {
    try {
      const account = await this.prisma.accounts.findFirst({
        where: { id: accountId, userId: userId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const createdAt = new Date(account.createdAt);
      return `${(createdAt.getMonth() + 1).toString().padStart(2, '0')}/${createdAt.getFullYear()}`;
    } catch (error) {
      console.error('Error finding account:', error);
      throw new BadRequestException('Error finding account');
    }
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    console.log('Creating account:', createAccountDto);

    try {
      const accountCount = await this.prisma.accounts.count({
        where: { userId: createAccountDto.userId },
      });

      if (accountCount >= 3) {
        throw new BadRequestException(
          'User cannot create more than 3 accounts',
        );
      }

      const account = await this.prisma.accounts.create({
        data: {
          name: createAccountDto.name,
          userId: createAccountDto.userId,
        },
      });

      console.log('Created account:', account);

      return { account };
    } catch (error) {
      console.error('Error creating account:', error);
      throw new BadRequestException('Error creating account');
    }
  }

  async updateAccount(id: number, createAccountDto: CreateAccountDto) {
    console.log('Updating account:', createAccountDto);

    try {
      const account = await this.prisma.accounts.update({
        where: { userId: createAccountDto.userId, id: id },
        data: { name: createAccountDto.name },
      });

      return account;
    } catch (error) {
      console.error('Error updating account:', error);
      throw new BadRequestException('Error updating account');
    }
  }

  async defaultAccount(id: number, createAccountDto: CreateAccountDto) {
    console.log('Updating account:', createAccountDto);

    try {
      const currentDefaultAccount = await this.prisma.accounts.findFirst({
        where: { userId: createAccountDto.userId, default: true },
      });

      if (currentDefaultAccount) {
        await this.prisma.accounts.update({
          where: { id: currentDefaultAccount.id },
          data: { default: false },
        });
      }

      // Set the specified account as default
      const account = await this.prisma.accounts.update({
        where: { id },
        data: { default: true },
      });

      return account;
    } catch (error) {
      console.error('Error updating account:', error);
      throw new BadRequestException('Error updating account');
    }
  }

  async deleteAccount(id: number, userId: number) {
    console.log('Deleting account ID:', id);

    try {
      const account = await this.prisma.accounts.findUnique({
        where: { userId: userId, id: id },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      const userAccounts = await this.prisma.accounts.findMany({
        where: { userId: userId },
      });

      if (userAccounts.length === 1) {
        throw new BadRequestException('User cannot delete the only account');
      }

      if (account.default) {
        throw new BadRequestException('User cannot delete the default account');
      }

      await this.prisma.budgets.deleteMany({
        where: { accountId: id },
      });

      await this.prisma.goals.deleteMany({
        where: { accountId: id },
      });

      await this.prisma.transactions.deleteMany({
        where: { accountId: id },
      });

      await this.prisma.accounts.delete({
        where: { id },
      });

      console.log('Deleted account:', account);

      return null;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new BadRequestException('Error deleting account');
    }
  }
}
