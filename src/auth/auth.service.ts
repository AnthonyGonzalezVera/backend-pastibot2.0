import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // ============ AUTH LOCAL (email + password) ============

  async registerLocal(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        provider: 'email',
        verified: true, // puedes poner false si quieres verificación de correo
        role: dto.role,
        gender: dto.gender,
      },
    });

    return this.buildAuthResponse(user);
  }

  async loginLocal(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password || user.provider !== 'email') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user);
  }

  // ============ AUTH OAUTH (Google / Facebook / X) ============

  async loginFromOAuth(user: User) {
    // Aquí podrías agregar lógica extra (logs, auditoría, etc.)
    return this.buildAuthResponse(user);
  }

  // ============ UTILIDAD ============

  private buildAuthResponse(user: User) {
    const token = this.signToken(user.id, user.role);
    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        bio: user.bio,
        photoUrl: user.photoUrl,
        provider: user.provider,
      },
    };
  }

  private signToken(userId: number, role: Role) {
    const payload = { sub: userId, role };
    return this.jwt.sign(payload);
  }
}
