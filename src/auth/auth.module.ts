import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { JwtService } from '../common/services/jwt/jwt.service';
import { SendgridService } from '../common/services/sendgrid/sendgrid.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [CommonModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, SendgridService, PrismaService],
})
export class AuthModule {}
