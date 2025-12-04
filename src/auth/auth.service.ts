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

  // ===============================
  // REGISTER LOCAL
  // ===============================
  async registerLocal(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) throw new ConflictException('El correo ya está registrado');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
        provider: 'email',
        verified: true,
        role: dto.role,
        gender: dto.gender,
      },
    });

    return this.buildAuthResponse(user);
  }

  // ===============================
  // LOGIN LOCAL
  // ===============================
  async loginLocal(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    if (!user.password) {
      throw new UnauthorizedException(
        'Tu cuenta fue creada con redes sociales. Debes crear una contraseña.'
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    return this.buildAuthResponse(user);
  }

  // ===============================
  // LOGIN SOCIAL
  // ===============================
  async loginFromOAuth(user: User) {
    return this.buildAuthResponse(user);
  }

  // ===============================
  // SET PASSWORD
  // ===============================
  async setPassword(userId: number, newPassword: string) {
    if (!userId) {
      throw new UnauthorizedException('No se pudo identificar al usuario.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        provider: 'email',
        verified: true,
      },
    });

    return this.buildAuthResponse(updated);
  }

  // ===============================
  // SET ROLE
  // ===============================
  async setRole(userId: number, role: Role) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return this.buildAuthResponse(updated);
  }

  // ===============================
  // TOKEN + RESPUESTA
  // ===============================
  private buildAuthResponse(user: User) {
    return {
      accessToken: this.signToken(user),
      user,
    };
  }

  private signToken(user: User) {
    return this.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
    });
  }
}
