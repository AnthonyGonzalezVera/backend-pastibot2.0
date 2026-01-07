import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  // Generar invitación
  async generateInvitation(caregiverId: number, patientName?: string, patientEmail?: string) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

    return this.prisma.invitation.create({
      data: {
        token,
        caregiverId,
        patientName,
        patientEmail,
        expiresAt,
      },
    });
  }

  // Aceptar invitación (el paciente usa el token)
  async acceptInvitation(token: string, patientId: number) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitación no encontrada');
    }

    if (invitation.used) {
      throw new BadRequestException('Esta invitación ya fue usada');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Esta invitación ha expirado');
    }

    // Vincular el paciente al cuidador
    const patient = await this.prisma.patient.update({
      where: { id: patientId },
      data: {
        caregiverId: invitation.caregiverId,
      },
    });

    // Marcar invitación como usada
    await this.prisma.invitation.update({
      where: { token },
      data: { used: true },
    });

    return patient;
  }

  // Obtener invitaciones del cuidador
  async getInvitations(caregiverId: number) {
    return this.prisma.invitation.findMany({
      where: { caregiverId },
      orderBy: { createdAt: 'desc' },
    });
  }
}