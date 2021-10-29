import { ApiProperty } from '@nestjs/swagger';

export class ReadImageProductDto {
  @ApiProperty({ description: 'name of the product' })
  name: string;

  @ApiProperty({ description: 'price of the product' })
  price: number;

  @ApiProperty({ description: 'stock of the product' })
  stock: number;

  @ApiProperty({ description: 'categories of the product' })
  categoryName: string[];

  @ApiProperty({ description: 'Images of the product' })
  imagesUrl: string[];
}
