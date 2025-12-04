import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const photo = profile.photos?.[0]?.value;

    if (!email) {
      return done(new Error('Google no devolvió email'), null);
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'google', providerId: googleId },
          { email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          provider: 'google',
          providerId: googleId,
          verified: true,
          photoUrl: photo || '',
          role: null,   // 👈 NO LE ASIGNAMOS ROL AQUÍ
        },
      });
    } else {
      if (user.provider !== 'google' || user.providerId !== googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleId,
            verified: true,
            photoUrl: photo || user.photoUrl,
          },
        });
      }
    }

    done(null, user);
  }
}
