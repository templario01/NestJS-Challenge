import { Role } from '.prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'name' })
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @ApiProperty({ description: 'Email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Role', examples: ['user', 'manager'] })
  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  role: Role = Role.user;
}
