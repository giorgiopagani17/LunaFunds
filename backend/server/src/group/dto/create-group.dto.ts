import { IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGroupDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  currency: string;

  @IsOptional()
  payGroup?: boolean;

  @IsOptional()
  isBoss?: boolean;
}
