import { Role } from '.prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  name: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: 'password is required' })
  @IsString()
  password: string;

  @IsEnum(Role, { message: 'Invalid role' })
  @IsOptional()
  role: Role = Role.user;
}
