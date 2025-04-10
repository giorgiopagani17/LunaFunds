import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GoalService } from './goal.service';
import { GoalController } from './goal.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [GoalService],
  controllers: [GoalController],
})
export class GoalModule {}
