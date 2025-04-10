import { IsNotEmpty, IsDate } from 'class-validator';

export class UpdateGroupTransactionDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  name: string;
}
