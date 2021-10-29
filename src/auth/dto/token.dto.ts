import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNotEmpty } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'token' })
  @IsEmail()
  token: string;

  @ApiProperty({ description: 'expiration' })
  @IsDate()
  expiration: Date;
}
