import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(caregiverId: number, dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        caregiverId,
      },
    });
  }

  async findAllForCaregiver(caregiverId: number) {
    return this.prisma.patient.findMany({
      where: { caregiverId },
      include: {
        medicines: true,
      },
    });
  }

  async findOneForCaregiver(caregiverId: number, id: number) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        caregiverId,
      },
      include: {
        medicines: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return patient;
  }

  async update(caregiverId: number, id: number, dto: UpdatePatientDto) {
    // Revisa primero que sea del cuidador
    await this.findOneForCaregiver(caregiverId, id);

    return this.prisma.patient.update({
      where: { id },
      data: dto,
    });
  }

  async remove(caregiverId: number, id: number) {
    // Revisa primero que sea del cuidador
    await this.findOneForCaregiver(caregiverId, id);

    return this.prisma.patient.delete({
      where: { id },
    });
  }
}
