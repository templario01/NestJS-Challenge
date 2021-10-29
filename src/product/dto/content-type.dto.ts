import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export enum TypesEnum {
  IMAGEJPEG = 'image/jpeg',
  IMAGEJPG = 'image/jpg',
  IMAGEPNG = 'image/png',
  IMAGETIFF = 'image/tiff',
}

export class ContentTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The content type', enum: TypesEnum })
  contentType: TypesEnum;
}
