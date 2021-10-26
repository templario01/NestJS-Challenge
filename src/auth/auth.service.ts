import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hashPassword } from 'src/common/helpers/encrypt.helper';
import { JWTPayload } from 'src/common/helpers/jwt.helper';
import { createEmail, HOST, sgMail } from 'src/common/helpers/sendgrid.helper';
import { JwtService } from 'src/common/services/jwt/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signup(user: CreateUserDto) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (userExists) {
      throw new NotAcceptableException('Email already registered');
    }
    const hash = hashPassword(user.password);
    const createdUser = await this.prismaService.user.create({
      data: {
        ...user,
        password: hash,
      },
    });
    if (user.role === 'user' || !user.role) {
      await this.prismaService.cart.create({
        data: {
          userId: createdUser.id,
        },
      });
    }
    const data: JWTPayload = {
      role: user.role || 'user',
      type: 'verification',
      uuid: createdUser.uuid,
    };
    const token = await this.jwtService.createToken(data, createdUser.id);
    const email = createEmail(
      user.email,
      'Verification',
      `Hello ${user.name} this is your verification email, use patch at this route`,
      `http://${HOST}/auth/${token.token}/verify`,
      token.token,
    );
    await sgMail.send(email);
    return { token: token.token, expiration: token.expiresAt };
  }

  verifyToken = async (token: string) => {
    const verifiedToken = await this.jwtService.verifyToken(
      token,
      'verification',
    );
    await this.prismaService.user.update({
      data: {
        veryfiedAt: new Date(),
      },
      where: {
        uuid: verifiedToken.uuid,
      },
    });
    return { message: 'Account verified' };
  };

  login = async (user: LoginUserDto) => {
    const userFound = await this.prismaService.user.findUnique({
      where: { email: user.email },
    });
    if (!userFound) {
      throw new NotFoundException('no user found');
    }
    if (!userFound.veryfiedAt) {
      throw new UnauthorizedException('user not verified');
    }
    const validPassword = compare(user.password, userFound.password);
    if (!validPassword) {
      throw new UnauthorizedException('email or password incorrect');
    }
    const tokenPayload: JWTPayload = {
      role: userFound.role,
      type: 'session',
      uuid: userFound.uuid,
    };
    const token = await this.jwtService.createToken(tokenPayload, userFound.id);
    return { token: token.token, expiration: token.expiresAt };
  };
}
