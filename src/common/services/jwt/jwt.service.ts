import { TokenType } from '.prisma/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  generateToken,
  JWTPayload,
  secret,
} from 'src/common/helpers/jwt.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendgridService } from '../sendgrid/sendgrid.service';

@Injectable()
export class JwtService {
  constructor(
    private sendGridService: SendgridService,
    private prismaSerive: PrismaService,
  ) {}
  verifyToken = async (
    token,
    type: TokenType = 'session',
  ): Promise<JWTPayload> => {
    try {
      const verifiedToken = jwt.verify(token, secret) as JWTPayload;
      if (verifiedToken.type !== type) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }
      return verifiedToken;
    } catch (e) {
      console.log(e);
      if (e instanceof jwt.TokenExpiredError) {
        if (type === 'verification') {
          // send new token to email
          throw new HttpException(
            'new token sent to email',
            HttpStatus.CONTINUE,
          );
        }
        throw new HttpException('token expired', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException('token error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  };
  createToken = async (data: JWTPayload, userId: number) => {
    const token = generateToken(data);
    const date = new Date();
    date.setHours(date.getHours() + 1);
    const tokenCreated = await this.prismaSerive.token.create({
      data: { token, userId, type: data.type, expiresAt: date },
    });
    return tokenCreated;
  };
}
