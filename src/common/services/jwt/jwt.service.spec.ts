import { User } from '.prisma/client';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from './jwt.service';
import {
  generateToken,
  JWTPayload,
  secret,
} from '../../../common/helpers/jwt.helper';

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
  });
});
