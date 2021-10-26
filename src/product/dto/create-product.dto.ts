import { IsBoolean, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  readonly name: string;

  @IsPositive()
  @IsNumber()
  readonly stock: number;

  @IsPositive()
  @IsNumber()
  readonly price: number;

  @IsBoolean()
  readonly active: boolean;

  @IsString({ each: true })
  readonly categoryName: string[];
}
