import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class CategoryResponseDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({ description: 'Category id' })
  id: number;
  @ApiProperty({ description: 'Category uuid' })
  uuid: string;
  @ApiProperty({ description: 'Category name' })
  name: string;
}
