import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateCryptoTransactionDto } from './dto/create-cryptoTransaction.dto';

@Controller('crypto')
@UseGuards(JwtAuthGuard)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get()
  async getCoins() {
    const data = await this.cryptoService.getCoinData('usd');
    return data.map((coin) => ({
      name: coin.name,
      price: coin.current_price,
    }));
  }

  @Get('balance')
  async getUserBalance(@Request() req) {
    return this.cryptoService.getUserBalance(req.user.sub);
  }

  @Get('performance')
  async getUserPerformance(@Request() req) {
    return this.cryptoService.getUserPerformance(req.user.sub);
  }

  @Get('all')
  async getCryptos(@Request() req) {
    return this.cryptoService.getCryptos(req.user.sub);
  }

  @Get('available')
  async getCryptoAvailable(@Request() req) {
    return this.cryptoService.getCryptoAvailable(req.user.sub);
  }

  @Get('portfolio')
  async getPortfolio(@Request() req) {
    return this.cryptoService.getPortfolio(req.user.sub);
  }

  @Post('sell')
  async sellCrypto(
    @Request() req,
    @Body() createCryptoTransactionDto: CreateCryptoTransactionDto,
  ) {
    createCryptoTransactionDto.userId = req.user.sub;
    return this.cryptoService.sellCrypto(createCryptoTransactionDto);
  }

  @Post('buy')
  async buyCrypto(
    @Request() req,
    @Body() createCryptoTransactionDto: CreateCryptoTransactionDto,
  ) {
    createCryptoTransactionDto.userId = req.user.sub;
    return this.cryptoService.buyCrypto(createCryptoTransactionDto);
  }
}
