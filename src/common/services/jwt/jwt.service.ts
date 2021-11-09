import { TokenType } from '.prisma/client';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { createEmail, HOST, sgMail } from '../../helpers/sendgrid.helper';
import {
  generateToken,
  JWTPayload,
  secret,
} from '../../../common/helpers/jwt.helper';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtService {
  constructor(private prismaService: PrismaService) {}
  verifyToken = async (
    token,
    type: TokenType = 'session',
  ): Promise<JWTPayload> => {
    let verifiedToken;
    try {
      verifiedToken = jwt.verify(token, secret) as JWTPayload;
    } catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        if (type === 'verification') {
          await this.sendNewVerification(token);
          throw new HttpException('New verification send', HttpStatus.CONTINUE);
        }
        throw new BadRequestException('Expired token');
      }
      throw new HttpException('token error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (verifiedToken.type !== type) {
      throw new BadRequestException('Invalid token');
    }
    return verifiedToken;
  };
  createToken = async (data: JWTPayload, userId: number) => {
    const token = generateToken(data);
    const date = new Date();
    date.setHours(date.getHours() + 1);
    const tokenCreated = await this.prismaService.token.create({
      data: { token, userId, type: data.type, expiresAt: date },
    });
    return tokenCreated;
  };
  sendNewVerification = async (token: string): Promise<void> => {
    const tokenToUpdate = await this.prismaService.token.findFirst({
      where: { token },
    });
    const user = await this.prismaService.user.findUnique({
      where: { id: tokenToUpdate.userId },
    });
    const data: JWTPayload = {
      role: user.role,
      type: 'verification',
      uuid: user.uuid,
    };
    const date = new Date();
    date.setHours(date.getHours() + 1);
    const newToken = await this.prismaService.token.update({
      where: { id: tokenToUpdate.id },
      data: {
        token: generateToken(data),
        expiresAt: date,
      },
    });
    const msg = createEmail(
      user.email,
      'token signup',
      `Hello ${user.name} use patch to this url to verify your account`,
      `http://${HOST}/users/${newToken.token}/verify`,
      newToken.token,
    );
    await sgMail.send(msg);
  };
}
