import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBudgetDto } from '../budget/dto/create-budget.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('/user/:accountId')
  async getBudgets(
    @Request() req,
    @Param('accountId', ParseIntPipe) accountId: number,
  ) {
    return this.budgetService.getBudgetsByUserId(accountId, req.user.sub);
  }

  @Post()
  async createBudget(@Request() req, @Body() createBudgetDto: CreateBudgetDto) {
    createBudgetDto.userId = req.user.sub;
    return this.budgetService.createBudget(createBudgetDto);
  }

  @Delete('delete/:id')
  async deleteBudget(@Param('id', ParseIntPipe) id: number) {
    return this.budgetService.deleteBudget(id);
  }

  @Put('update/:id')
  async updateBudget(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() CreateBudgetDto: CreateBudgetDto,
  ) {
    CreateBudgetDto.userId = req.user.sub;
    return this.budgetService.updateBudget(id, CreateBudgetDto);
  }
}
