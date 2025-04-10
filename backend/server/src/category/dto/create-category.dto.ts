import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  image: string;
}
