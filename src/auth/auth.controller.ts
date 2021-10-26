import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { jwtAuthGuard } from 'src/common/guards/token.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @UseGuards(jwtAuthGuard)
  @Post('signup')
  signup(@Body() body: CreateUserDto, @Request() req) {
    // console.log(req.user);
    // return req.user;
    return this.authService.signup(body);
  }

  @Patch(':token/verify')
  verify(@Param('token') token: string) {
    return this.authService.verifyToken(token);
  }

  @Post('login')
  login(@Body() body: LoginUserDto) {
    return this.authService.login(body);
  }

  @UseGuards(jwtAuthGuard)
  @Post('logout')
  logout(@Request() req) {
    return this.authService.logout(req.user);
    console.log(req.user);
    return req.user;
  }
}
