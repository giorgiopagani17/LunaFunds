import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async getBudgetsByUserId(accountId: number, userId: number) {
    console.log('Fetching budgets for user ID:', userId);

    const budgets = await this.prisma.budgets.findMany({
      where: {
        userId: userId,
        accountId: accountId,
      },
    });

    console.log('Fetched budgets:', budgets);

    const budgetsWithTransactionSums = await Promise.all(
      budgets.map(async (budget) => {
        let transactionSum = 0;

        const getTransactions = async (startDate, endDate) => {
          const whereClause: any = {
            userId: userId,
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
          };

          if (budget.accountId) {
            whereClause.accountId = budget.accountId; // Add accountId if it exists
          }

          // Print the query being executed
          console.log(
            `Executing query for budget ${budget.id} with where:`,
            JSON.stringify(whereClause, null, 2),
          );

          try {
            const transactions = await this.prisma.transactions.findMany({
              where: whereClause,
            });
            console.log(
              `Transactions found for budget ${budget.id}:`,
              transactions,
            );
            return transactions;
          } catch (error) {
            console.error(
              `Error fetching transactions for budget ${budget.id}:`,
              error,
            );
            return []; // Return an empty array if an error occurs
          }
        };

        try {
          let startDate, endDate;

          if (budget.timeline === 'monthly') {
            // Monthly Timeline: First day of the current month to the last day of the current month
            startDate = new Date();
            startDate.setDate(1); // Set to the first day of the current month
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1); // Move to the next month
            endDate.setDate(0); // Set to the last day of the current month
            endDate.setHours(23, 59, 59, 999);

            // Se oggi è l'ultimo giorno del mese, usiamo l'endDate fino alla fine di oggi
            if (new Date().getDate() === endDate.getDate()) {
              endDate = new Date(); // Imposta l'endDate a oggi (ultimo giorno del mese)
              endDate.setHours(23, 59, 59, 999); // Imposta l'ora per includere tutte le transazioni di oggi
            }

            console.log(`Budget ${budget.id} - Timeline: Monthly`);
          } else if (budget.timeline === 'annual') {
            // Annual Timeline: First day of the current year to the last day of the current year
            startDate = new Date();
            startDate.setMonth(0, 1); // Set to January 1st
            endDate = new Date(startDate);
            endDate.setFullYear(startDate.getFullYear() + 1, 0, 0); // Move to next year (January 1st)
            endDate.setDate(endDate.getDate() - 1); // Set to December 31st of the current year
            endDate.setHours(23, 59, 59, 999);

            // Se oggi è l'ultimo giorno dell'anno, usiamo l'endDate fino alla fine di oggi
            if (new Date().getDate() === endDate.getDate()) {
              endDate = new Date(); // Imposta l'endDate a oggi (ultimo giorno dell'anno)
              endDate.setHours(23, 59, 59, 999); // Imposta l'ora per includere tutte le transazioni di oggi
            }

            console.log(`Budget ${budget.id} - Timeline: Annual`);
          } else if (budget.timeline === 'weekly') {
            // Weekly Timeline: Start of the current week (Monday) to the end of the current week (Sunday)
            startDate = new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay()); // Set to Monday
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6); // Set to Sunday
            endDate.setHours(23, 59, 59, 999);

            console.log('sadsfsfsf23wrwfwfwe', startDate, endDate);
            // Se oggi è l'ultimo giorno della settimana (domenica), usiamo l'endDate fino alla fine di oggi
            if (new Date().getDay() === 0) {
              // Sunday
              endDate = new Date(); // Imposta l'endDate a oggi (ultimo giorno della settimana)
              endDate.setHours(23, 59, 59, 999); // Imposta l'ora per includere tutte le transazioni di oggi
            }

            console.log(`Budget ${budget.id} - Timeline: Weekly`);
          }

          const transactions = await getTransactions(startDate, endDate);
          transactionSum = transactions
            .filter((transaction) => transaction.amount < 0)
            .reduce(
              (sum, transaction) => sum + Math.abs(transaction.amount),
              0,
            );

          console.log(
            `Transaction sum for budget ${budget.id}:`,
            transactionSum,
          );
        } catch (error) {
          console.error(
            `Error processing transactions for budget ${budget.id}:`,
            error,
          );
        }

        return {
          ...budget,
          transactionSum: Math.abs(transactionSum), // Convert to positive for display
        };
      }),
    );

    return budgetsWithTransactionSums;
  }

  async createBudget(createBudgetDto: CreateBudgetDto) {
    try {
      if (!createBudgetDto.name || createBudgetDto.name.trim() === '') {
        throw new BadRequestException('Name cannot be null or empty');
      }

      const existingBudget = await this.prisma.budgets.findFirst({
        where: {
          userId: createBudgetDto.userId,
          name: {
            equals: createBudgetDto.name,
          },
        },
      });

      if (existingBudget) {
        console.log(`Duplicate budget found: ${existingBudget.name}`);
        throw new ConflictException(
          `Budget with name '${createBudgetDto.name}' already exists for this user.`,
        );
      }

      // Build the data object dynamically
      const budgetData: any = {
        name: createBudgetDto.name,
        amount: createBudgetDto.amount,
        timeline: createBudgetDto.timeline,
        userId: createBudgetDto.userId,
        // Only include categoryId if it's not 0
        ...(createBudgetDto.categoryId &&
          createBudgetDto.categoryId !== 0 && {
            categoryId: createBudgetDto.categoryId,
          }),
        // Only include accountId if it's not 0
        ...(createBudgetDto.accountId &&
          createBudgetDto.accountId !== 0 && {
            accountId: createBudgetDto.accountId,
          }),
      };

      // Create the budget
      return await this.prisma.budgets.create({
        data: budgetData,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Budget with the same properties already exists.',
        );
      }
      throw new BadRequestException('Error creating Budget: ' + error.message);
    }
  }

  async deleteBudget(id: number) {
    try {
      const budget = await this.prisma.budgets.delete({
        where: {
          id: id,
        },
      });
      return budget;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Budget with ID ${id} not found.`);
      }
      throw new ConflictException('Unable to delete budget: ' + error.message);
    }
  }

  async updateBudget(id: number, updateBudgetDto: CreateBudgetDto) {
    try {
      const budget = await this.prisma.budgets.update({
        where: { id },
        data: {
          ...updateBudgetDto,
        },
      });
      return budget;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Budget not found');
      }
      throw new Error('Error updating budget');
    }
  }
}
