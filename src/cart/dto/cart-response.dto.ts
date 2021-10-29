import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime';
import { CartProductDto } from './cart-product.dto';

export class CartResponseDto {
  @ApiProperty({ description: 'cart id' })
  id: number;
  @ApiProperty({ description: 'cart uuid' })
  uuid: string;
  @ApiProperty({ description: 'cart total' })
  total: number | Decimal;
  @ApiProperty({ description: 'cart products' })
  products: CartProductDto[];
}
