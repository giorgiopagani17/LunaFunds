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
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('/user')
  async getAccounts(@Request() req) {
    return this.accountService.getAccountsByUserId(req.user.sub);
  }

  @Get('/user/:accountId')
  async getAccountsById(@Request() req, @Param('accountId') accountId: number) {
    return this.accountService.getAccountsById(req.user.sub, accountId);
  }

  @Get('/creation')
  async getAccountCreationDate(
    @Request() req,
    @Query('account') accountId: number,
  ) {
    return this.accountService.getAccountCreationDate(req.user.sub, accountId);
  }

  @Post()
  async createAccount(
    @Request() req,
    @Body() CreateAccountDto: CreateAccountDto,
  ) {
    CreateAccountDto.userId = req.user.sub;
    return this.accountService.createAccount(CreateAccountDto);
  }

  @Put('update/:id')
  async updateAccount(
    @Request() req,
    @Body() CreateAccountDto: CreateAccountDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    CreateAccountDto.userId = req.user.sub;
    return this.accountService.updateAccount(id, CreateAccountDto);
  }

  @Put('default/:id')
  async defaultAccount(
    @Request() req,
    @Body() CreateAccountDto: CreateAccountDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    CreateAccountDto.userId = req.user.sub;
    return this.accountService.defaultAccount(id, CreateAccountDto);
  }

  @Delete('delete/:id')
  async deleteAccount(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.accountService.deleteAccount(id, req.user.sub);
  }
}
