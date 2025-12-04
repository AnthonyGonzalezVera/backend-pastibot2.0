import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  // Crear medicamento para un paciente
  @Post('patients/:patientId/medicines')
  create(
    @Req() req: any,
    @Param('patientId') patientId: string,
    @Body() dto: CreateMedicineDto,
  ) {
    return this.medicinesService.createForPatient(
      req.user.userId,
      Number(patientId),
      dto,
    );
  }

  // Ver medicamentos de un paciente
  @Get('patients/:patientId/medicines')
  findAll(
    @Req() req: any,
    @Param('patientId') patientId: string,
  ) {
    return this.medicinesService.findAllForPatient(
      req.user.userId,
      Number(patientId),
    );
  }

  // Ver un medicamento por id
  @Get('medicines/:id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.medicinesService.findOne(req.user.userId, Number(id));
  }

  // Actualizar medicamento
  @Patch('medicines/:id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMedicineDto,
  ) {
    return this.medicinesService.update(
      req.user.userId,
      Number(id),
      dto,
    );
  }

  // Eliminar medicamento
  @Delete('medicines/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.medicinesService.remove(req.user.userId, Number(id));
  }
}
