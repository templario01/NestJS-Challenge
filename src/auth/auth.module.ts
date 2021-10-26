import { Module } from '@nestjs/common';
import { JwtService } from 'src/common/services/jwt/jwt.service';
import { SendgridService } from 'src/common/services/sendgrid/sendgrid.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, SendgridService],
})
export class AuthModule {}
