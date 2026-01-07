import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  // Generar invitación (CUIDADOR)
  @Post('generate')
  async generate(
    @Req() req: any,
    @Body() body: { patientName?: string; patientEmail?: string },
  ) {
    const invitation = await this.invitationsService.generateInvitation(
      req.user.id,
      body.patientName,
      body.patientEmail,
    );

    // Generar el link para compartir
    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation/${invitation.token}`;

    return {
      invitation,
      invitationLink,
      whatsappMessage: `¡Hola! Te invito a usar Pastibot para gestionar tus medicamentos. Haz clic aquí: ${invitationLink}`,
    };
  }

  // Aceptar invitación (PACIENTE)
  @Post('accept/:token')
  async accept(@Param('token') token: string, @Req() req: any) {
    // Aquí req.user.id es el ID del paciente que aceptó
    return this.invitationsService.acceptInvitation(token, req.user.id);
  }

  // Listar invitaciones del cuidador
  @Get()
  async list(@Req() req: any) {
    return this.invitationsService.getInvitations(req.user.id);
  }
}