import { User } from '.prisma/client';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from './jwt.service';
import { generateToken, JWTPayload } from '../../../common/helpers/jwt.helper';
import { BadRequestException, HttpException } from '@nestjs/common';

describe('JwtService', () => {
  let service: JwtService;
  let prisma: PrismaService;
  let user: User;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule, PrismaModule],
          inject: [ConfigService],
          useFactory: async () => ({
            secret: 'ravn_nerdery',
            signOptions: {
              expiresIn: '1h',
            },
          }),
        }),
      ],
      providers: [JwtService],
    }).compile();

    service = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
    await prisma.$connect();
    await prisma.user.deleteMany();
    user = await prisma.user.create({
      data: {
        email: 'johndoe@email.com',
        password: 'password',
        name: 'John Doe',
      },
    });
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should return user', async () => {
      const data: JWTPayload = {
        role: 'user',
        type: 'session',
        uuid: 'test',
      };
      const token = await generateToken(data);
      const user = await service.verifyToken(token);
      expect(user.uuid).toEqual(data.uuid);
    });
    it('should throw Invalid token', async () => {
      const data: JWTPayload = {
        role: 'user',
        type: 'session',
        uuid: 'test',
      };
      const token = await generateToken(data);
      try {
        await service.verifyToken(token, 'verification');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Invalid token');
      }
    });
    it('should throw expired token', async () => {
      const data: JWTPayload = {
        role: 'user',
        type: 'session',
        uuid: 'test',
      };
      const token = await generateToken(data, '-1s');
      try {
        await service.verifyToken(token);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Expired token');
      }
    });
    it('should throw new verification send', async () => {
      const data: JWTPayload = {
        role: 'user',
        type: 'verification',
        uuid: user.uuid,
      };
      const tokenString = await generateToken(data, '-1s');
      const token = await prisma.token.create({
        data: {
          token: tokenString,
          expiresAt: new Date(),
          userId: user.id,
          type: 'verification',
        },
      });
      try {
        await service.verifyToken(token.token, 'verification');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toEqual('New verification send');
      }
    });
    it('should throw Token error', async () => {
      try {
        await service.verifyToken('invalid-token');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toEqual('token error');
      }
    });
  });
});
