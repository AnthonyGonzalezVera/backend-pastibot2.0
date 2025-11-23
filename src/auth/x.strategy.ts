import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class XStrategy extends PassportStrategy(Strategy, 'x') {
  constructor(private prisma: PrismaService) {
    super({
      consumerKey: process.env.X_CONSUMER_KEY || '',
      consumerSecret: process.env.X_CONSUMER_SECRET || '',
      callbackURL: process.env.X_CALLBACK_URL || 'http://localhost:3000/auth/x/redirect',
      includeEmail: true,
    });
  }

  async validate(
    token: string,
    tokenSecret: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) {
    const xId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || profile.username;
    const photo = profile.photos?.[0]?.value;

    if (!email) {
      return done(new Error('X/Twitter no devolvió email'), null);
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { provider: 'x', providerId: xId },
          { email },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          provider: 'x',
          providerId: xId,
          verified: true,
          photoUrl: photo || '',
          role: 'PACIENTE',
        },
      });
    } else {
      if (user.provider !== 'x' || user.providerId !== xId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'x',
            providerId: xId,
            verified: true,
            photoUrl: photo || user.photoUrl,
          },
        });
      }
    }

    done(null, user);
  }
}
