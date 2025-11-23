import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private prisma: PrismaService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/redirect',
      profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ) {
    const fbId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName;
    const photo = profile.photos?.[0]?.value;

    // Facebook a veces no devuelve email, pero vamos a exigirlo
    if (!email) {
      return done(new Error('Facebook no devolvió email'), null);
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'facebook', providerId: fbId },
          { email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          provider: 'facebook',
          providerId: fbId,
          verified: true,
          photoUrl: photo || '',
          role: 'PACIENTE',
        },
      });
    } else {
      if (user.provider !== 'facebook' || user.providerId !== fbId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'facebook',
            providerId: fbId,
            verified: true,
            photoUrl: photo || user.photoUrl,
          },
        });
      }
    }

    done(null, user);
  }
}
