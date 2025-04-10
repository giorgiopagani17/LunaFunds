import {
  IsInt,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateGoalDto {
  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  accountId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  timeline: string;
}
