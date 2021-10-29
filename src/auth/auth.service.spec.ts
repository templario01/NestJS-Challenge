import { TokenType } from '.prisma/client';
import {
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { hashPassword } from '../common/helpers/encrypt.helper';
import { CommonModule } from '../common/common.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async () => ({
            secret: 'ravn_nerdery',
            signOptions: {
              expiresIn: '1h',
            },
          }),
        }),
        CommonModule,
      ],
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
    await prisma.user.deleteMany();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup function', () => {
    it('should return a token and create a cart', async () => {
      expect.assertions(2);
      const user = {
        email: 'joelvaldezangeles@gmail.com',
        password: '123456789',
        name: 'john Doe',
        role: 'user',
      };
      const result = await service.signup(plainToClass(CreateUserDto, user));
      const cart = await prisma.cart.findFirst({
        where: {
          user: {
            email: user.email,
          },
        },
      });
      expect(cart).toBeTruthy();
      expect(result.token).toBeTruthy();
    });
    it('should return an error if the user already exists', async () => {
      expect.assertions(2);
      const user = {
        email: 'joelvaldezangeles@gmail.com',
        password: '123456789',
        name: 'john Doe',
        role: 'user',
      };
      try {
        await service.signup(plainToClass(CreateUserDto, user));
      } catch (e) {
        expect(e).toBeInstanceOf(NotAcceptableException);
        expect(e.message).toBe('Email already registered');
      }
    });
  });
  describe('veryfy function', () => {
    it('should verify an account', async () => {
      expect.assertions(1);
      const user = await prisma.user.findUnique({
        where: { email: 'joelvaldezangeles@gmail.com' },
      });
      const token = await prisma.token.findFirst({
        where: {
          userId: user.id,
          type: TokenType.verification,
        },
      });
      const result = await service.verifyToken(token.token);
      expect(result.message).toBe('Account verified');
    });
  });
  describe('signin function', () => {
    it('should return a token', async () => {
      expect.assertions(1);
      const user = {
        email: 'joelvaldezangeles@gmail.com',
        password: '123456789',
      };
      const result = await service.signin(plainToClass(LoginUserDto, user));
      expect(result.token).toBeTruthy();
    });
    it('should throw user not veryfied', async () => {
      expect.assertions(2);
      const user = {
        email: 'joelvaldezangeles+1@gmail.com',
        password: '123456789',
      };
      await prisma.user.create({
        data: {
          email: user.email,
          password: hashPassword(user.password),
          name: 'john Doe',
        },
      });
      try {
        await service.signin(plainToClass(LoginUserDto, user));
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('User not verified');
      }
    });
    it('should return an error if the user does not exist', async () => {
      expect.assertions(2);
      const user = {
        email: 'notexists@gmail.com',
        password: '123456789',
      };
      try {
        await service.signin(plainToClass(LoginUserDto, user));
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe('Invalid email or password');
      }
    });
    it('should throw an error if the password is incorrect', async () => {
      expect.assertions(2);
      const user = {
        email: 'joelvaldezangeles@gmail.com',
        password: '12345678',
      };
      try {
        await service.signin(plainToClass(LoginUserDto, user));
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Invalid email or password');
      }
    });
  });

  describe('refresh token function', () => {
    it('should return a new token', async () => {
      expect.assertions(1);
      const user = await prisma.user.findUnique({
        where: { email: 'joelvaldezangeles@gmail.com' },
      });
      const token = await prisma.token.findFirst({
        where: {
          userId: user.id,
          type: TokenType.session,
        },
      });
      const result = await service.refreshToken('Bearer ' + token.token);
      expect(result.token).toBeTruthy();
    });
    it('should throw no token found', async () => {
      expect.assertions(2);
      try {
        await service.refreshToken('Bearer ' + 'notexists');
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('No token found');
      }
    });
  });

  describe('logout function', () => {
    it('should return a message', async () => {
      expect.assertions(1);
      const user = await prisma.user.findUnique({
        where: { email: 'joelvaldezangeles@gmail.com' },
      });
      const token = await prisma.token.findFirst({
        where: {
          userId: user.id,
          type: TokenType.session,
        },
      });
      const result = await service.logout('Bearer ' + token.token);
      expect(result.message).toBe('Logged out');
    });
  });
});
