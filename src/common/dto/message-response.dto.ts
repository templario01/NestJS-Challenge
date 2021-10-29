import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class MessageResponseDto {
  @ApiProperty({ description: 'message', example: 'ok' })
  @IsString()
  readonly message: string;
}
