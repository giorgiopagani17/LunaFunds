import { IsNotEmpty, IsDate } from 'class-validator';

export class CreateGroupTransactionDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  groupId: number;

  @IsNotEmpty()
  accountId: number;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  name: string;
}
