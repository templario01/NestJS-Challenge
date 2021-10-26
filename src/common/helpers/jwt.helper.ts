import { Role, TokenType } from '.prisma/client';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export const secret = process.env.JWT_SECRET || 'ravn_nerdery';
export const expires = process.env.JWT_EXPIRES || '1h';

export type JWTPayload = {
  uuid: string;
  cartUuid?: string;
  role: Role;
  type: TokenType;
};

export const generateToken = (data: JWTPayload, expiresIn = expires) => {
  const token = jwt.sign(data, secret, { expiresIn });
  return token;
};
