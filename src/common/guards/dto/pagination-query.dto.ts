import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({ required: false, description: 'number of elements' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit: number;

  @ApiProperty({ required: false, description: 'elements to omit' })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  offset: number;
}
