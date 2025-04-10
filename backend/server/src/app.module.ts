import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CryptoModule } from './crypto/crypto.module';
import { TransactionModule } from './transaction/transaction.module';
import { AccountModule } from './account/account.module';
import { CategoryModule } from './category/category.module';
import { BudgetModule } from './budget/budget.module';
import { GoalModule } from './goal/goal.module';
import { GroupModule } from './group/group.module';
import { UserModule } from './user/user.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    CryptoModule,
    TransactionModule,
    AccountModule,
    CategoryModule,
    BudgetModule,
    GoalModule,
    GroupModule,
    UserModule,
    ReportModule,
  ],
})
export class AppModule {}
