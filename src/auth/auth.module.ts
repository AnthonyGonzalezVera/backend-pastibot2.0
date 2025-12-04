import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt.guard';

import { GoogleStrategy } from './google.strategy';
import { FacebookStrategy } from './facebook.strategy';
import { XStrategy } from './x.strategy';

import { PrismaModule } from '../prisma/prisma.module';
import { GoogleAuthGuard } from './google.guard';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey-pastibot',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,

    // OAUTH STRATEGIES
    GoogleStrategy,
    FacebookStrategy,
    XStrategy,

    // CUSTOM GUARDS
    GoogleAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
