import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ description: 'User email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}
