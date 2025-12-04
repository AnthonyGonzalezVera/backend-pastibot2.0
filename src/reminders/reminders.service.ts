import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async createForMedicine(medicineId: number, dto: CreateReminderDto) {
    // Verifica que el medicamento exista
    const med = await this.prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!med) {
      throw new NotFoundException('Medicamento no encontrado');
    }

   return this.prisma.reminder.create({
  data: {
    time: dto.time,
    days: dto.days ?? "",       
    label: dto.label ?? null,
    repeat: dto.repeat ?? true,
    active: dto.active ?? true,
    medicineId,
  },
});

  }

  async findAllForMedicine(medicineId: number) {
    return this.prisma.reminder.findMany({
      where: { medicineId },
    });
  }

  async update(id: number, dto: UpdateReminderDto) {
    return this.prisma.reminder.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.reminder.delete({
      where: { id },
    });
  }
}
