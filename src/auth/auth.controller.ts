import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import type { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { GoogleAuthGuard } from './google.guard';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =====================================================
  // AUTH LOCAL
  // =====================================================
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.registerLocal(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.loginLocal(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Req() req: any) {
    return req.user;
  }

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleRedirect(@Req() req: any, @Res() res: Response) {
    const auth = await this.authService.loginFromOAuth(req.user);
    return res.redirect(
      `http://localhost:8100/social-success?token=${auth.accessToken}`,
    );
  }

  // =====================================================
  // FACEBOOK LOGIN
  // =====================================================
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin() {}

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookRedirect(@Req() req: any, @Res() res: Response) {
    const auth = await this.authService.loginFromOAuth(req.user);
    return res.redirect(
      `http://localhost:8100/social-success?token=${auth.accessToken}`,
    );
  }

  // =====================================================
  // X / TWITTER LOGIN
  // =====================================================
  @Get('x')
  @UseGuards(AuthGuard('x'))
  xLogin() {}

  @Get('x/redirect')
  @UseGuards(AuthGuard('x'))
  async xRedirect(@Req() req: any, @Res() res: Response) {
    const auth = await this.authService.loginFromOAuth(req.user);
    return res.redirect(
      `http://localhost:8100/social-success?token=${auth.accessToken}`,
    );
  }

  // =====================================================
  // SET PASSWORD (POST GOOGLE)
  // =====================================================
  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  async setPassword(@Req() req: any, @Body('password') password: string) {
    return this.authService.setPassword(req.user.id, password);
  }

  // =====================================================
  // 🚀 SET ROLE DESPUÉS DEL LOGIN SOCIAL
  // =====================================================
  @Post('set-role')
  @UseGuards(JwtAuthGuard)
  async setRole(@Req() req: any, @Body('role') role: Role) {
    return this.authService.setRole(req.user.id, role);
  }
}
