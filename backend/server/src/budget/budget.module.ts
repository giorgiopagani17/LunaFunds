import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [BudgetService],
  controllers: [BudgetController],
})
export class BudgetModule {}
