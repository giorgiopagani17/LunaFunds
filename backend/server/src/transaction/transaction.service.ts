import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import axios from 'axios';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}
  private readonly apiUrl = 'https://api.currencybeacon.com/v1/latest';

  async getLatestTransactionsByUserId(userId: number, accountId: number) {
    try {
      const currentDate = new Date(); // Data attuale con l'ora corrente
      currentDate.setHours(0, 0, 0, 0); // Imposta l'ora a 00:00:00.000
      const startDate = new Date();
      startDate.setDate(currentDate.getDate() - 5);
      startDate.setHours(0, 0, 0, 0); // Imposta l'ora a 00:00:00.000

      const transactions = await this.prisma.transactions.findMany({
        where: {
          userId,
          accountId,
          createdAt: {
            gte: startDate,
            lt: currentDate,
          },
        },
        include: {
          categories: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      console.log(transactions);
      return transactions;
    } catch (error) {
      throw new BadRequestException(
        'Error fetching transactions: ' + error.message,
      );
    }
  }

  async getTimelineTransactionsByUserId(userId: number, accountId: number) {
    try {
      const currentYear = new Date().getFullYear();
      const transactions = await this.prisma.transactions.findMany({
        where: {
          userId,
          accountId,
          createdAt: {
            gte: new Date(`${currentYear}-01-01T00:00:00Z`),
            lt: new Date(`${currentYear + 1}-01-01T00:00:00Z`),
          },
        },
        include: {
          categories: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return transactions;
    } catch (error) {
      throw new BadRequestException(
        'Error fetching transactions: ' + error.message,
      );
    }
  }

  async getGroupTransactionsByUserId(
    userActive: number,
    filterParams: {
      searchQuery?: string;
      userID?: number;
      groupID?: number;
    },
  ) {
    try {
      const userGroup = await this.prisma.userGroup.findFirst({
        where: {
          userId: userActive,
          groupId: filterParams.groupID,
        },
      });

      if (!userGroup) {
        throw new ForbiddenException(
          'User is not associated with the specified group',
        );
      }

      const whereConditions: any = {};

      if (filterParams.searchQuery) {
        whereConditions.name = {
          contains: filterParams.searchQuery,
        };
      }

      if (filterParams.userID) {
        whereConditions.userId = filterParams.userID;
      }

      if (filterParams.groupID) {
        whereConditions.groupId = filterParams.groupID;
      }

      const transactions = await this.prisma.groupTransactions.findMany({
        where: whereConditions,
        include: {
          users: {
            select: {
              name: true, // Fetch only `name` and `id`
              id: true,
              userGroup: {
                select: {
                  color: true, // Fetch only the `color` field from `userGroup`
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return transactions;
    } catch (error) {
      throw new BadRequestException(
        'Error fetching transactions: ' + error.message,
      );
    }
  }

  async getTransactionsByUserId(
    userId: number,
    filterParams: {
      searchQuery?: string;
      categories?: string;
      month?: string;
      accountID?: number;
    },
  ) {
    try {
      const whereConditions: any = { userId };
      const typeConditions: any[] = [];
      const categoryConditions: any[] = [];

      if (filterParams.searchQuery) {
        whereConditions.name = {
          contains: filterParams.searchQuery,
        };
      }

      if (filterParams.categories) {
        const categoryIds = filterParams.categories.split(',').map(Number);
        categoryConditions.push({ categoryId: { in: categoryIds } });
      }

      if (filterParams.month) {
        const [monthName, year] = filterParams.month
          .match(/([a-zA-Z]+)(\d+)/)
          .slice(1, 3);
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        const startDate = new Date(Number(year), monthIndex, 1);
        const endDate = new Date(
          Number(year),
          monthIndex + 1,
          0,
          23,
          59,
          59,
          999,
        );
        whereConditions.createdAt = {
          gte: startDate,
          lt: endDate,
        };
      }

      if (filterParams.accountID) {
        whereConditions.accountId = filterParams.accountID;
      }

      const finalConditions: any = { userId };

      if (
        whereConditions.createdAt ||
        whereConditions.name ||
        whereConditions.accountId
      ) {
        finalConditions.AND = [{ ...whereConditions }];
      }

      if (typeConditions.length > 0) {
        finalConditions.AND = [
          ...(finalConditions.AND || []),
          { OR: typeConditions },
        ];
      }

      if (categoryConditions.length > 0) {
        finalConditions.AND = [
          ...(finalConditions.AND || []),
          { OR: categoryConditions },
        ];
      }

      const transactions = await this.prisma.transactions.findMany({
        where: finalConditions,
        include: {
          categories: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return transactions;
    } catch (error) {
      throw new BadRequestException(
        'Error fetching transactions: ' + error.message,
      );
    }
  }

  async getBalanceByUserId(userId: number): Promise<number> {
    try {
      const result = await this.prisma.transactions.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          userId: userId,
        },
      });
      return result._sum.amount || 0;
    } catch (error) {
      throw new BadRequestException('Error fetching balance: ' + error.message);
    }
  }

  async getIncomeByUserId(userId: number, accountId: number) {
    try {
      const incomes = await this.prisma.transactions.findMany({
        where: {
          userId,
          accountId,
          amount: { gt: 0 },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { incomes };
    } catch (error) {
      throw new BadRequestException('Error fetching incomes: ' + error.message);
    }
  }

  async getOutcomeByUserId(userId: number, accountId: number) {
    try {
      const outcomes = await this.prisma.transactions.findMany({
        where: {
          userId,
          accountId,
          amount: { lt: 0 },
        },
        orderBy: { createdAt: 'desc' },
      });
      return { outcomes };
    } catch (error) {
      throw new BadRequestException(
        'Error fetching outcomes: ' + error.message,
      );
    }
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    console.log(createTransactionDto);
    try {
      return await this.prisma.transactions.create({
        data: createTransactionDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Transaction with the same properties already exists.',
        );
      }
      throw new BadRequestException(
        'Error creating transaction: ' + error.message,
      );
    }
  }

  async createTransfer(createTransactionDto: CreateTransactionDto) {
    console.log(createTransactionDto);
    try {
      const category = await this.prisma.categories.findFirst({
        where: {
          userId: createTransactionDto.userId,
          name: 'Transfer',
        },
      });

      if (!category) {
        throw new BadRequestException(
          'Category "Transfer" not found for the user.',
        );
      }

      const transaction = await this.prisma.transactions.create({
        data: {
          name: createTransactionDto.name,
          amount: -createTransactionDto.amount,
          accountId: createTransactionDto.accountId,
          createdAt: createTransactionDto.createdAt,
          categoryId: category.id,
          userId: createTransactionDto.userId,
          transfer: null,
        },
      });

      const reverseTransaction = await this.prisma.transactions.create({
        data: {
          name: createTransactionDto.name,
          amount: createTransactionDto.amount,
          accountId: createTransactionDto.transfer,
          createdAt: createTransactionDto.createdAt,
          categoryId: category.id,
          userId: createTransactionDto.userId,
          transfer: transaction.id,
        },
      });
      console.log(reverseTransaction);
      await this.prisma.transactions.update({
        where: { id: transaction.id },
        data: { transfer: reverseTransaction.id },
      });
      console.log('ciao');
      return { transaction, reverseTransaction };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Transaction with the same properties already exists.',
        );
      }
      throw new BadRequestException(
        'Error creating transfer: ' + error.message,
      );
    }
  }

  async deleteTransfer(
    userId: number,
    idTransfer: number,
    id2Transfer: number,
  ) {
    try {
      await this.prisma.transactions.deleteMany({
        where: {
          id: {
            in: [idTransfer, id2Transfer],
          },
          userId: userId,
        },
      });

      return { message: 'Transfer deleted successfully' };
    } catch (error) {
      throw new BadRequestException(
        'Error deleting transfer: ' + error.message,
      );
    }
  }

  async createBankTransfer(createTransactionDto: CreateTransactionDto) {
    console.log(createTransactionDto);
    try {
      const userReceiver = await this.prisma.users.findFirst({
        where: {
          iban: createTransactionDto.iban,
        },
        select: { id: true, currency: true },
      });

      if (!userReceiver) {
        throw new NotFoundException(
          'Receiver with the provided IBAN not found',
        );
      }

      const userSender = await this.prisma.users.findFirst({
        where: {
          id: createTransactionDto.userId,
        },
        select: { name: true, currency: true, iban: true },
      });

      if (!userSender) {
        throw new NotFoundException('Sender not found');
      }

      if (userSender.iban === createTransactionDto.iban) {
        throw new BadRequestException('You cannot transfer money to yourself');
      }

      const categoryReceiver = await this.prisma.categories.findFirst({
        where: {
          userId: userReceiver.id,
          name: 'Bank Transfer',
        },
      });

      const categorySender = await this.prisma.categories.findFirst({
        where: {
          userId: createTransactionDto.userId,
          name: 'Bank Transfer',
        },
      });

      if (!categoryReceiver || !categorySender) {
        throw new BadRequestException(
          'Category "Bank Transfer" not found for the users.',
        );
      }

      const senderTransaction = await this.prisma.transactions.create({
        data: {
          name: createTransactionDto.name,
          amount: -createTransactionDto.amount,
          accountId: createTransactionDto.accountId,
          createdAt: createTransactionDto.createdAt,
          categoryId: categorySender.id,
          userId: createTransactionDto.userId,
          transfer: null,
          bankTransfer: null,
        },
      });

      const accountReceiver = await this.prisma.accounts.findFirst({
        where: {
          userId: userReceiver.id,
          default: true,
        },
      });

      let convertedAmount: number;
      try {
        convertedAmount = await this.convertCurrency(
          createTransactionDto.amount,
          userSender.currency,
          userReceiver.currency,
        );
      } catch (error) {
        console.error('Error converting currency:', error.message);
        convertedAmount = createTransactionDto.amount;
      }

      const receiverTransaction = await this.prisma.transactions.create({
        data: {
          name: 'Bank Transfer from ' + userSender.name,
          amount: convertedAmount,
          accountId: accountReceiver.id,
          createdAt: createTransactionDto.createdAt,
          categoryId: categoryReceiver.id,
          userId: userReceiver.id,
          transfer: null,
          bankTransfer: senderTransaction.id,
        },
      });

      await this.prisma.transactions.update({
        where: { id: senderTransaction.id },
        data: { bankTransfer: receiverTransaction.id },
      });

      const notification = await this.prisma.notifications.create({
        data: {
          fromUserId: createTransactionDto.userId,
          toUserId: userReceiver.id,
          message: `You received a bank transfer of ${convertedAmount}${userReceiver.currency} from ${userSender.name}`,
          read: false,
        },
      });

      return { notification };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Transaction with the same properties already exists.',
        );
      }
      throw new BadRequestException(
        'Error creating transfer: ' + error.message,
      );
    }
  }

  async deleteTransaction(id: number, userId: number) {
    try {
      const transaction = await this.prisma.transactions.findUnique({
        where: { id },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      if (transaction.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to delete this transaction',
        );
      }

      return await this.prisma.transactions.delete({ where: { id } });
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

  async updateTransaction(
    id: number,
    updateTransactionDto: CreateTransactionDto,
  ) {
    try {
      console.log('ciaoioweisodioa', updateTransactionDto);
      const transaction = await this.prisma.transactions.update({
        where: { id },
        data: {
          name: updateTransactionDto.name,
          amount: updateTransactionDto.amount,
          accountId: updateTransactionDto.accountId,
          createdAt: updateTransactionDto.createdAt,
          categoryId: updateTransactionDto.categoryId,
          updatedAt: new Date(),
        },
      });
      return transaction;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Transaction not found');
      }
      throw new Error('Error updating transaction');
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
