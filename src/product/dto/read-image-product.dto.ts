import { Exclude } from 'class-transformer';

export class ReadImageProductDto {
  name: string;
  categoryName: string[];
  price: number;
  stock: number;

  @Exclude()
  category;
  imagesUrl: string[];
}
