import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateAccountDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
