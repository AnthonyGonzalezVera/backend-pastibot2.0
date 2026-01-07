import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Injectable()
export class MedicinesService {
  constructor(private prisma: PrismaService) {}

  // -------------------------------
  // Crear medicina para un paciente
  // -------------------------------
  async createForPatient(
    caregiverId: number,
    patientId: number,
    dto: CreateMedicineDto,
  ) {
    // ✅ VALIDACIÓN REAL
    const patient = await this.prisma.patient.findFirst({
      where: {
        id: patientId,
        caregiverId: caregiverId,
      },
    });

    if (!patient) {
      throw new BadRequestException(
        'Paciente no existe o no pertenece a este cuidador',
      );
    }

    // ✅ Crear medicina
    return this.prisma.medicine.create({
      data: {
        name: dto.name,
        dosage: dto.dosage,
        stock: dto.stock ?? 0,
        qrData: dto.qrData ?? null,

        // ⏰ CAMPOS IMPORTANTES
        time: dto.time,              // "08:00"
        days: dto.days ?? [],        // ["Lu","Ma"]
        label: dto.label ?? null,    // texto visible

        patientId: patient.id,
        caregiverId: caregiverId,
      },
    });
  }

  // -------------------------------
  // Obtener medicinas
  // -------------------------------
  async findAllForPatient(caregiverId: number, patientId: number) {
    return this.prisma.medicine.findMany({
      where: { patientId, caregiverId },
      include: { reminders: true },
    });
  }

  async findOne(caregiverId: number, id: number) {
    const med = await this.prisma.medicine.findFirst({
      where: { id, caregiverId },
      include: { reminders: true },
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
