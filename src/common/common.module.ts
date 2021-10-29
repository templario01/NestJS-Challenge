import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from './services/jwt/jwt.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'ravn_nerdery',
        signOptions: { expiresIn: configService.get('JWT_EXPIRES') || '1h' },
      }),
    }),
  ],
  providers: [JwtService, PrismaService, JwtStrategy, ConfigService],
  exports: [JwtService, PrismaService],
})
export class CommonModule {}
