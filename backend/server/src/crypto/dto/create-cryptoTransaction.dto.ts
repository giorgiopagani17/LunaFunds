import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCryptoTransactionDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  cryptoId: number;

  @IsNotEmpty()
  valueWhenBought: number;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  stockId?: number;
}
