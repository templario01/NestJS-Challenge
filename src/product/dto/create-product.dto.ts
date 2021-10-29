import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime';
import { IsBoolean, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Product 1' })
  @IsString()
  readonly name: string;

  @ApiProperty({ description: 'Product price', example: 100 })
  @IsPositive()
  @IsNumber()
  readonly stock: number;

  @ApiProperty({ description: 'Product price', example: 25.5 })
  @IsPositive()
  @IsNumber()
  readonly price: number | Decimal;

  @ApiProperty({ description: 'Product is active', example: true })
  @IsBoolean()
  readonly active: boolean;

  @ApiProperty({ description: 'category names', example: '["category1"]' })
  @IsString({ each: true })
  readonly categoryName: string[];
}
