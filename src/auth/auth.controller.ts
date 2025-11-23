import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ======= AUTH LOCAL (email + password) =======

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
    // req.user viene de JwtStrategy.validate()
    return req.user;
  }

  // ======= GOOGLE =======

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Esto redirige a Google automáticamente
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: any) {
    // req.user viene de GoogleStrategy.validate()
    return this.authService.loginFromOAuth(req.user);
  }

  // ======= FACEBOOK =======

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin() {
    // Redirección a Facebook
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookRedirect(@Req() req: any) {
    return this.authService.loginFromOAuth(req.user);
  }

  // ======= X (Twitter) =======

  @Get('x')
  @UseGuards(AuthGuard('x'))
  xLogin() {
    // Redirección a X/Twitter
  }

  @Get('x/redirect')
  @UseGuards(AuthGuard('x'))
  async xRedirect(@Req() req: any) {
    return this.authService.loginFromOAuth(req.user);
  }
}
