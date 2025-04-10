import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalService {
  constructor(private prisma: PrismaService) {}

  async getGoalsByUserId(accountId: number, userId: number) {
    console.log('Fetching goals for user ID:', userId);

    const goals = await this.prisma.goals.findMany({
      where: {
        userId: userId,
        accountId: accountId,
      },
    });

    console.log('Fetched goals:', goals);

    const goalsWithTransactionSums = await Promise.all(
      goals.map(async (goal) => {
        let transactionSum = 0;

        const getTransactions = async (startDate, endDate) => {
          const whereClause: any = {
            userId: userId,
            createdAt: {
              gte: startDate,
              lt: endDate,
            },
          };

          if (goal.accountId) {
            whereClause.accountId = goal.accountId; // Add accountId if it exists
          }

          // Print the query being executed
          console.log(
            `Executing query for goal ${goal.id} with where:`,
            JSON.stringify(whereClause, null, 2),
          );

          try {
            const transactions = await this.prisma.transactions.findMany({
              where: whereClause,
            });
            console.log(
              `Transactions found for goal ${goal.id}:`,
              transactions,
            );
            return transactions;
          } catch (error) {
            console.error(
              `Error fetching transactions for goal ${goal.id}:`,
              error,
            );
            return []; // Return an empty array if an error occurs
          }
        };

        try {
          let startDate, endDate;

          if (goal.timeline === 'monthly') {
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

            console.log(`Goal ${goal.id} - Timeline: Monthly`);
          } else if (goal.timeline === 'annual') {
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

            console.log(`Goal ${goal.id} - Timeline: Annual`);
          } else if (goal.timeline === 'weekly') {
            // Weekly Timeline: Start of the current week (Monday) to the end of the current week (Sunday)
            startDate = new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay()); // Set to Monday
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6); // Set to Sunday
            endDate.setHours(23, 59, 59, 999);

            // Se oggi è l'ultimo giorno della settimana (domenica), usiamo l'endDate fino alla fine di oggi
            if (new Date().getDay() === 0) {
              // Sunday
              endDate = new Date(); // Imposta l'endDate a oggi (ultimo giorno della settimana)
              endDate.setHours(23, 59, 59, 999); // Imposta l'ora per includere tutte le transazioni di oggi
            }

            console.log(`Goal ${goal.id} - Timeline: Weekly`);
          }

          const transactions = await getTransactions(startDate, endDate);
          transactionSum = transactions.reduce(
            (sum, transaction) => sum + transaction.amount,
            0,
          );

          console.log(`Transaction sum for goal ${goal.id}:`, transactionSum);
        } catch (error) {
          console.error(
            `Error processing transactions for goal ${goal.id}:`,
            error,
          );
        }

        return {
          ...goal,
          transactionSum: transactionSum < 0 ? 0 : transactionSum, // Return 0 if transactionSum is negative
        };
      }),
    );

    return goalsWithTransactionSums;
  }

  async createGoal(createGoalDto: CreateGoalDto) {
    try {
      if (!createGoalDto.name || createGoalDto.name.trim() === '') {
        throw new BadRequestException('Name cannot be null or empty');
      }

      // Check if a Goal with the same name already exists for the user (case insensitive)
      const existingGoal = await this.prisma.goals.findFirst({
        where: {
          userId: createGoalDto.userId,
          name: {
            equals: createGoalDto.name,
          },
        },
      });

      if (existingGoal) {
        console.log(`Duplicate goal found: ${existingGoal.name}`);
        throw new ConflictException(
          `Goal with name '${createGoalDto.name}' already exists for this user.`,
        );
      }

      const goalData: any = {
        name: createGoalDto.name,
        amount: createGoalDto.amount,
        timeline: createGoalDto.timeline,
        userId: createGoalDto.userId,
        // Only include categoryId if it's not 0
        ...(createGoalDto.categoryId &&
          createGoalDto.categoryId !== 0 && {
            categoryId: createGoalDto.categoryId,
          }),
        // Only include accountId if it's not 0
        ...(createGoalDto.accountId &&
          createGoalDto.accountId !== 0 && {
            accountId: createGoalDto.accountId,
          }),
      };

      return await this.prisma.goals.create({
        data: goalData,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Goal with the same properties already exists.',
        );
      }
      throw new BadRequestException('Error creating Goal: ' + error.message);
    }
  }

  async deleteGoal(id: number) {
    try {
      const goal = await this.prisma.goals.delete({
        where: {
          id: id,
        },
      });
      return goal;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Goal with ID ${id} not found.`);
      }
      throw new ConflictException('Unable to delete Goal: ' + error.message);
    }
  }

  async updateGoal(id: number, updateGoalDto: CreateGoalDto) {
    try {
      const goal = await this.prisma.goals.update({
        where: { id },
        data: {
          ...updateGoalDto,
        },
      });
      return goal;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Goal not found');
      }
      throw new Error('Error updating goal');
    }
  }
}
