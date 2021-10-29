import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateCategoryDto } from '../../category/dto/update-category.dto';
import { CreateProductDto } from './create-product.dto';

export class ProductResponseDto extends PartialType(CreateProductDto) {
  @ApiProperty({ description: 'Product id' })
  id: number;
  @ApiProperty({ description: 'Product uuid' })
  uuid: string;
  @ApiProperty({ description: 'Product likes' })
  likes: number;
  @ApiProperty({ description: 'Product categories' })
  category: UpdateCategoryDto;
}
