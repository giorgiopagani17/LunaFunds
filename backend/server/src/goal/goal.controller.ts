import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GoalService } from './goal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateGoalDto } from './dto/create-goal.dto';

@Controller('goals')
@UseGuards(JwtAuthGuard) // Applica il guard a tutte le rotte di questo controller
export class GoalController {
  constructor(private readonly goalService: GoalService) {} // Cambiato a goalService

  @Get('/user/:accountId')
  async getGoals(
    @Request() req,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.goalService.getGoalsByUserId(accountId, req.user.sub);
  }

  @Post()
  async createGoal(@Request() req, @Body() createGoalDto: CreateGoalDto) {
    createGoalDto.userId = req.user.sub;
    return this.goalService.createGoal(createGoalDto);
  }

  @Delete('delete/:id')
  async deleteGoal(@Param('id', ParseIntPipe) id: number) {
    return this.goalService.deleteGoal(id);
  }

  @Put('update/:id')
  async updateGoal(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() CreateGoalDto: CreateGoalDto,
  ) {
    CreateGoalDto.userId = req.user.sub;
    return this.goalService.updateGoal(id, CreateGoalDto);
  }
}
