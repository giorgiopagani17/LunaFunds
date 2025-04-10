import { IsNotEmpty, IsDate, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  accountId: number;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  categoryId: number;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  name: string;

  @IsOptional()
  transfer?: number;

  @IsOptional()
  iban?: string;
}
