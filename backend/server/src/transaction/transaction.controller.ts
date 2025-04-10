import {
  Body,
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  Post,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transactions')
@UseGuards(JwtAuthGuard) // Applicazione del guard
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('user/year')
  async getTimelineTransactionsByUserId(
    @Request() req,
    @Query('accountID', ParseIntPipe) accountID: number,
  ) {
    return this.transactionService.getTimelineTransactionsByUserId(
      req.user.sub,
      accountID,
    );
  }

  @Get('user/latest')
  async getLatestTransactionsByUserId(
    @Request() req,
    @Query('accountID', ParseIntPipe) accountID: number,
  ) {
    return this.transactionService.getLatestTransactionsByUserId(
      req.user.sub,
      accountID,
    );
  }

  @Get('user')
  async getTransactionsByUserId(
    @Request() req,
    @Query('searchQuery') searchQuery: string,
    @Query('categories') categories: string,
    @Query('month') month: string,
    @Query('accountID', ParseIntPipe) accountID: number,
  ) {
    const userId = req.user.sub;

    const filterParams = {
      searchQuery,
      categories,
      month,
      accountID,
    };

    return this.transactionService.getTransactionsByUserId(
      userId,
      filterParams,
    );
  }

  @Get('group')
  async getGroupTransactionsByUserId(
    @Request() req,
    @Query('searchQuery') searchQuery: string,
    @Query('selectedUser', ParseIntPipe) userID: number,
    @Query('groupID', ParseIntPipe) groupID: number,
  ) {
    const userActive = req.user.sub;

    const filterParams = {
      searchQuery,
      userID,
      groupID,
    };

    return this.transactionService.getGroupTransactionsByUserId(
      userActive,
      filterParams,
    );
  }

  @Get('balance')
  async getBalanceByUserId(@Request() req) {
    return this.transactionService.getBalanceByUserId(req.user.sub);
  }

  @Get('user/income')
  async getIncomesByUserId(
    @Request() req,
    @Query('account') accountId: number,
  ) {
    return this.transactionService.getIncomeByUserId(req.user.sub, accountId);
  }

  @Get('user/outcome')
  async getExpensesByUserId(
    @Request() req,
    @Query('account') accountId: number,
  ) {
    return this.transactionService.getOutcomeByUserId(req.user.sub, accountId);
  }

  @Post()
  async createTransaction(
    @Request() req,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    createTransactionDto.userId = req.user.sub;
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Post('/transfer')
  async createTransfer(
    @Request() req,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    createTransactionDto.userId = req.user.sub;
    return this.transactionService.createTransfer(createTransactionDto);
  }

  @Delete('/transfer/:idTransfer/:id2Transfer')
  async deleteTransfer(
    @Request() req,
    @Param('idTransfer', ParseIntPipe) idTransfer: number,
    @Param('id2Transfer', ParseIntPipe) id2Transfer: number,
  ) {
    return this.transactionService.deleteTransfer(
      req.user.sub,
      idTransfer,
      id2Transfer,
    );
  }

  @Post('/banktransfer')
  async creatBankTransfer(
    @Request() req,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    createTransactionDto.userId = req.user.sub;
    return this.transactionService.createBankTransfer(createTransactionDto);
  }

  @Delete('delete/:idTransactions')
  async deleteTransaction(
    @Param('idTransactions', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.transactionService.deleteTransaction(id, req.user.sub);
  }

  @Put('update/:id')
  async updateTransaction(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() CreateTransactionDto: CreateTransactionDto,
  ) {
    CreateTransactionDto.userId = req.user.sub;
    return this.transactionService.updateTransaction(id, CreateTransactionDto);
  }
}
