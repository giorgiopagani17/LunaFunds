import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { Crypto } from './interfaces/crypto.interface';
import { CreateCryptoTransactionDto } from './dto/create-cryptoTransaction.dto';

@Injectable()
export class CryptoService {
  private readonly apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';

  constructor(private prisma: PrismaService) {}

  async getCoinData(vs_currency: string): Promise<any> {
    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          vs_currency,
          order: 'market_cap_desc',
          per_page: 10,
          page: 1,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Error fetching data from CoinGecko for ${vs_currency}`,
        error.response?.status || 500,
      );
    }
  }

  async checkAndUpdateCryptoData(currency: string): Promise<void> {
    const today = new Date();
    today.setHours(today.getHours(), 0, 0, 0);
    const todayISOString = today.toISOString();
    console.log(todayISOString);

    const cryptos = await this.prisma.crypto.findMany();
    const currencies = [
      { code: 'usd', symbol: '$' },
      { code: 'eur', symbol: '€' },
      { code: 'gbp', symbol: '£' },
    ];

    const targetCurrency = currencies.find((c) => c.symbol === currency);
    if (!targetCurrency) {
      console.error(`Currency ${currency} not supported`);
      return;
    }

    const coinDataList = await this.getCoinData(targetCurrency.code);

    for (const crypto of cryptos) {
      if (crypto.currency !== targetCurrency.symbol) continue;

      const updatedAtISOString = new Date(crypto.updatedAt).toISOString();
      if (updatedAtISOString < todayISOString) {
        const coinData = coinDataList.find((coin) => coin.name === crypto.name);
        if (coinData) {
          await this.prisma.crypto.update({
            where: { id: crypto.id },
            data: {
              name: coinData.name,
              last1Value: crypto.lastValue,
              last2Value: crypto.last1Value,
              last3Value: crypto.last2Value,
              lastValue: crypto.actualValue,
              actualValue: coinData.current_price,
              updatedAt: new Date(),
              currency: targetCurrency.symbol,
            },
          });
          console.log(
            `Updated crypto: ${crypto.name} for currency: ${targetCurrency.symbol}`,
          );
        } else {
          console.error(
            `No matching coinData found for crypto: ${crypto.name} in currency: ${targetCurrency.symbol}`,
          );
        }
      }
    }
  }

  async getUserBalance(userId: number): Promise<{
    newBalance: number;
    oldBalance: number;
    lastBalance: number;
    last1Balance: number;
    last2Balance: number;
    last3Balance: number;
  }> {
    const userCurrency = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    try {
      await this.checkAndUpdateCryptoData(userCurrency.currency);
    } catch (error) {
      console.error('Error updating crypto data:', error);
    }

    const myStocks = await this.prisma.stocks.findMany({
      where: { userId },
    });

    const oldBalance = myStocks.reduce(
      (sum, stock) => sum + stock.valueWhenBought * stock.amount,
      0,
    );

    const newBalance = await myStocks.reduce(async (sumPromise, stock) => {
      const sum = await sumPromise;
      const crypto = await this.prisma.crypto.findUnique({
        where: { id: stock.cryptoId },
      });
      if (!crypto) {
        console.error(
          `Crypto not found for id: ${stock.cryptoId} and currency: ${userCurrency.currency}`,
        );
        return sum;
      }
      const currentPrice = crypto.actualValue;
      console.log(currentPrice);
      return sum + currentPrice * stock.amount;
    }, Promise.resolve(0));

    console.log(userCurrency.currency);
    const lastBalance = await myStocks.reduce(async (sumPromise, stock) => {
      const sum = await sumPromise;
      const crypto = await this.prisma.crypto.findUnique({
        where: { id: stock.cryptoId },
      });
      if (!crypto) {
        console.error(
          `Crypto not found for id: ${stock.cryptoId} and currency: ${userCurrency.currency}`,
        );
        return sum;
      }
      const currentPrice = crypto.lastValue;
      return sum + currentPrice * stock.amount;
    }, Promise.resolve(0));

    const last1Balance = await myStocks.reduce(async (sumPromise, stock) => {
      const sum = await sumPromise;
      const crypto = await this.prisma.crypto.findUnique({
        where: { id: stock.cryptoId },
      });
      if (!crypto) {
        console.error(
          `Crypto not found for id: ${stock.cryptoId} and currency: ${userCurrency.currency}`,
        );
        return sum;
      }
      const currentPrice = crypto.last1Value;
      return sum + currentPrice * stock.amount;
    }, Promise.resolve(0));

    const last2Balance = await myStocks.reduce(async (sumPromise, stock) => {
      const sum = await sumPromise;
      const crypto = await this.prisma.crypto.findUnique({
        where: { id: stock.cryptoId },
      });
      if (!crypto) {
        console.error(
          `Crypto not found for id: ${stock.cryptoId} and currency: ${userCurrency.currency}`,
        );
        return sum;
      }
      const currentPrice = crypto.last2Value;
      return sum + currentPrice * stock.amount;
    }, Promise.resolve(0));

    const last3Balance = await myStocks.reduce(async (sumPromise, stock) => {
      const sum = await sumPromise;
      const crypto = await this.prisma.crypto.findUnique({
        where: { id: stock.cryptoId },
      });
      if (!crypto) {
        console.error(
          `Crypto not found for id: ${stock.cryptoId} and currency: ${userCurrency.currency}`,
        );
        return sum;
      }
      const currentPrice = crypto.last3Value;
      return sum + currentPrice * stock.amount;
    }, Promise.resolve(0));

    return {
      newBalance,
      lastBalance,
      last1Balance,
      last2Balance,
      last3Balance,
      oldBalance,
    };
  }

  async getUserPerformance(userId: number): Promise<{
    newBalance: number;
    oldBalance: number;
    createdAt: string;
  }> {
    const userCurrency = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    try {
      await this.checkAndUpdateCryptoData(userCurrency.currency);
    } catch (error) {
      console.error('Error updating crypto data:', error);
    }

    const myStocks = await this.prisma.stocks.findMany({
      where: { userId },
    });

    if (myStocks.length === 0) {
      throw new HttpException('No stocks found for the user', 500);
    }

    const oldBalance = myStocks.reduce(
      (sum, stock) => sum + stock.valueWhenBought * stock.amount,
      0,
    );

    const newBalance = await myStocks.reduce(async (sumPromise, stock) => {
      const sum = await sumPromise;
      const crypto = await this.prisma.crypto.findUnique({
        where: { id: stock.cryptoId },
      });
      if (!crypto) {
        console.error(
          `Crypto not found for id: ${stock.cryptoId} and currency: ${userCurrency.currency}`,
        );
        return sum;
      }
      const currentPrice = crypto.actualValue;
      return sum + currentPrice * stock.amount;
    }, Promise.resolve(0));

    const youngestStock = myStocks.reduce((youngest, stock) => {
      return new Date(stock.createdAt) > new Date(youngest.createdAt)
        ? stock
        : youngest;
    }, myStocks[0]);

    return {
      newBalance,
      oldBalance,
      createdAt: youngestStock.createdAt.toISOString(),
    };
  }

  async getCryptos(userId: number): Promise<Crypto[]> {
    try {
      const userCurrency = await this.prisma.users.findUnique({
        where: { id: userId },
        select: { currency: true },
      });

      try {
        await this.checkAndUpdateCryptoData(userCurrency.currency);
      } catch (error) {
        console.error('Error updating crypto data:', error);
      }

      const cryptos = await this.prisma.crypto.findMany({
        where: { currency: userCurrency.currency },
      });

      console.log(cryptos);
      return cryptos as Crypto[];
    } catch (error) {
      console.error('Error fetching cryptos:', error);
      return [];
    }
  }

  async getCryptoAvailable(userId: number): Promise<Crypto[]> {
    const userCurrency = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    try {
      await this.checkAndUpdateCryptoData(userCurrency.currency);
    } catch (error) {
      console.error('Error updating crypto data:', error);
    }

    const crypto = await this.prisma.crypto.findMany({
      where: { currency: userCurrency.currency },
    });

    return crypto as Crypto[];
  }

  async getPortfolio(userId: number): Promise<Crypto[]> {
    const userCurrency = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    try {
      await this.checkAndUpdateCryptoData(userCurrency.currency);
    } catch (error) {
      console.error('Error updating crypto data:', error);
    }

    const stocks = await this.prisma.stocks.findMany({
      where: { userId },
    });

    const cryptoIds = stocks.map((stock) => stock.cryptoId);
    const cryptos = await this.prisma.crypto.findMany({
      where: {
        id: { in: cryptoIds },
      },
    });

    const cryptoMap = cryptos.reduce(
      (map, crypto) => {
        map[crypto.id] = crypto;
        return map;
      },
      {} as Record<number, Crypto>,
    );

    const result = stocks.map((stock) => {
      const crypto = cryptoMap[stock.cryptoId];
      return {
        ...crypto,
        idStock: stock.id,
        lastValue: stock.valueWhenBought * stock.amount,
        actualValue: crypto.actualValue * stock.amount,
      };
    });

    return result;
  }

  async sellCrypto(
    createCryptoTransactionDto: CreateCryptoTransactionDto,
  ): Promise<boolean> {
    const existingStock = await this.prisma.stocks.findFirst({
      where: {
        id: createCryptoTransactionDto.stockId,
      },
    });

    if (!existingStock) {
      throw new Error('Stock not found');
    }

    console.log(existingStock.id);
    const cryptoActualAmount = await this.prisma.crypto.findUnique({
      where: { id: existingStock.cryptoId },
      select: { actualValue: true },
    });

    if (!cryptoActualAmount) {
      throw new Error('Crypto not found');
    }

    const totalStockValue = Number(
      (existingStock.valueWhenBought * existingStock.amount).toFixed(2),
    );

    if (createCryptoTransactionDto.amount >= totalStockValue) {
      await this.prisma.stocks.delete({
        where: { id: existingStock.id },
      });
    } else {
      const newAmount =
        (totalStockValue - createCryptoTransactionDto.amount) /
        cryptoActualAmount.actualValue;
      await this.prisma.stocks.update({
        where: { id: existingStock.id },
        data: { amount: newAmount },
      });
    }

    const categoryId = await this.prisma.categories.findFirst({
      where: { name: 'Crypto' },
      select: { id: true },
    });

    const accountId = await this.prisma.accounts.findFirst({
      where: { userId: createCryptoTransactionDto.userId, default: true },
      select: { id: true },
    });

    const amountWithoutFee =
      createCryptoTransactionDto.amount -
      createCryptoTransactionDto.amount * 0.01;

    const transaction = await this.prisma.transactions.create({
      data: {
        userId: createCryptoTransactionDto.userId,
        accountId: accountId.id,
        categoryId: categoryId.id,
        amount: +amountWithoutFee, // Ensure the amount is negative
        name: createCryptoTransactionDto.name,
        bankTransfer: 0,
      },
    });

    return !!transaction;
  }

  async buyCrypto(
    createCryptoTransactionDto: CreateCryptoTransactionDto,
  ): Promise<boolean> {
    const amount =
      createCryptoTransactionDto.amount /
      createCryptoTransactionDto.valueWhenBought;

    await this.prisma.stocks.create({
      data: {
        userId: createCryptoTransactionDto.userId,
        cryptoId: createCryptoTransactionDto.cryptoId,
        valueWhenBought: createCryptoTransactionDto.valueWhenBought,
        amount: amount,
      },
    });

    const categoryId = await this.prisma.categories.findFirst({
      where: { name: 'Crypto', userId: createCryptoTransactionDto.userId },
      select: { id: true },
    });

    const accountId = await this.prisma.accounts.findFirst({
      where: { userId: createCryptoTransactionDto.userId, default: true },
      select: { id: true },
    });

    const transaction = await this.prisma.transactions.create({
      data: {
        userId: createCryptoTransactionDto.userId,
        accountId: accountId.id,
        categoryId: categoryId.id,
        amount: -createCryptoTransactionDto.amount,
        name: createCryptoTransactionDto.name,
        bankTransfer: 0,
      },
    });

    return !!transaction;
  }
}
