import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  async createForPatient(
    caregiverId: number,
    patientId: number,
    dto: CreateMedicineDto,
  ) {
    // Verifica que el paciente pertenece a este cuidador
    const patient = await this.prisma.patient.findFirst({
      where: { id: patientId, caregiverId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado para este cuidador');
    }

    return this.prisma.medicine.create({
      data: {
        ...dto,
        patientId,
        caregiverId,
      },
    });
  }

  async findAllForPatient(caregiverId: number, patientId: number) {
    return this.prisma.medicine.findMany({
      where: {
        patientId,
        caregiverId,
      },
      include: {
        reminders: true,
      },
    });
  }

  async findOne(caregiverId: number, id: number) {
    const med = await this.prisma.medicine.findFirst({
      where: {
        id,
        caregiverId,
      },
      include: {
        reminders: true,
      },
    });

    if (!med) {
      throw new NotFoundException('Medicamento no encontrado');
    }

    return med;
  }

  async update(caregiverId: number, id: number, dto: UpdateMedicineDto) {
    await this.findOne(caregiverId, id);

    return this.prisma.medicine.update({
      where: { id },
      data: dto,
    });
  }

  async remove(caregiverId: number, id: number) {
    await this.findOne(caregiverId, id);

    return this.prisma.medicine.delete({
      where: { id },
    });
  }
}
