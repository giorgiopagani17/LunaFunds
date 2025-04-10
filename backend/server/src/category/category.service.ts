import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories(userId: number) {
    console.log('Fetching categories for user ID:', userId);

    const categories = await this.prisma.categories.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true, // Include the category ID
        name: true,
      },
      distinct: ['name'],
      orderBy: {
        name: 'asc',
      },
    });

    console.log('Fetched categories:', categories);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }

  async getCategoriesWithTransactionSum(userId: number, accountID: number) {
    try {
      console.log(
        'Fetching categories and transaction count for user ID:',
        userId,
        accountID,
      );

      // Fetch the categories with transaction count
      const categories = await this.prisma.categories.findMany({
        where: {
          userId: userId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true, // Include the createdAt property
          image: true,
        },
        distinct: ['name'],
      });

      const categoriesWithSum = await Promise.all(
        categories.map(async (category) => {
          const sumResult = await this.prisma.transactions.aggregate({
            _sum: {
              amount: true,
            },
            _count: {
              id: true,
            },
            where: {
              categoryId: category.id,
              accountId: accountID,
            },
          });

          console.log('Category:', category.name, 'Sum:', sumResult);
          return {
            id: category.id,
            createdAt: category.createdAt,
            image: category.image,
            name: category.name,
            totalAmount: sumResult._sum.amount || 0,
            transactionCount: sumResult._count.id || 0,
          };
        }),
      );

      return categoriesWithSum.sort(
        (a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount),
      );
    } catch (error) {
      console.error('Error fetching categories with transaction sum:', error);
      throw new Error('Internal server error');
    }
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      if (!createCategoryDto.name || createCategoryDto.name.trim() === '') {
        throw new BadRequestException('Name null');
      }

      // Controlla se esiste già una categoria con lo stesso nome per lo stesso utente (case insensitive)
      const existingCategory = await this.prisma.categories.findFirst({
        where: {
          userId: createCategoryDto.userId,
          name: {
            // Verifica case insensitive
            equals: createCategoryDto.name,
          },
        },
      });

      // Se la categoria esiste, solleva un'eccezione
      if (existingCategory) {
        throw new BadRequestException(
          `Category with name '${createCategoryDto.name}' already exists for this user.`,
        );
      }

      // Crea la nuova categoria
      return await this.prisma.categories.create({
        data: createCategoryDto,
      });
    } catch (error) {
      throw new BadRequestException(
        'Error creating category: ' + error.message,
      );
    }
  }

  async deleteCategory(id: number) {
    try {
      console.log('Deleting category with ID:', id);
      // Elimina la categoria dal database
      const category = await this.prisma.categories.delete({
        where: {
          id: id, // Specifica l'ID della categoria da eliminare
        },
      });
      return category; // Restituisci la categoria eliminata
    } catch (error) {
      // Gestione degli errori
      if (error.code === 'P2025') {
        // Codice errore per record non trovato in Prisma
        throw new NotFoundException(
          'La Categoria è collegata ad alcune transazioni',
        );
      }
      throw new ConflictException('Unable to delete category');
    }
  }

  async updateCategory(id: number, updateCategoryDto: CreateCategoryDto) {
    try {
      const categoryToUpdate = await this.prisma.categories.findFirst({
        where: {
          id,
        },
      });

      const categoriesUnauthorized = [
        'Transfer',
        'Bank Transfer',
        'Group',
        'Crypto',
      ];
      if (categoriesUnauthorized.includes(categoryToUpdate.name)) {
        throw new BadRequestException('Category cannot be updated');
      }

      if (!categoryToUpdate) {
        throw new NotFoundException('Category not found');
      }

      const category = await this.prisma.categories.update({
        where: { id },
        data: {
          ...updateCategoryDto,
          updatedAt: new Date(),
        },
      });
      return category;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw new Error('Error updating category');
    }
  }
}
