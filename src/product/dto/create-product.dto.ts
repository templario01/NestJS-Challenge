import {
  IsBoolean,
  IsDecimal,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  readonly name: string;

  @IsPositive()
  @IsNumber()
  readonly stock: number;

  @IsDecimal()
  @IsPositive()
  @IsNumber()
  readonly price: number;

  @IsBoolean()
  readonly active: boolean;

  @IsNumber()
  readonly idCategory: number;
}
