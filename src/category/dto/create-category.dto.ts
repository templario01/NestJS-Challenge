import { IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @MaxLength(25)
  @IsString()
  readonly name: string;
}
