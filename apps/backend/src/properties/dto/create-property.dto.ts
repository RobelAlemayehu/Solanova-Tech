import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  location!: string;

  @IsNumber()
  @IsPositive()
  price!: number;
}
