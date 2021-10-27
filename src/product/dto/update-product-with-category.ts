import { IsString } from 'class-validator';

export class UpdateProductDtoAndCategory {
  @IsString()
  readonly categoryName: string;
}
