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

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class MedicinesController {
  constructor(private readonly medicinesService: MedicinesService) {}

  @Post(':patientId/medicines')
  create(
    @Req() req: any,
    @Param('patientId') patientId: string,
    @Body() dto: CreateMedicineDto,
  ) {
    return this.medicinesService.createForPatient(
      req.user.id,          // ✅ CAMBIO: userId → id
      Number(patientId),
      dto,
    );
  }

  @Get(':patientId/medicines')
  findAll(
    @Req() req: any,
    @Param('patientId') patientId: string,
  ) {
    return this.medicinesService.findAllForPatient(
      req.user.id,          // ✅ CAMBIO: userId → id
      Number(patientId),
    );
  }

  @Get('medicines/:id')
  findOne(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.medicinesService.findOne(
      req.user.id,          // ✅ CAMBIO: userId → id
      Number(id),
    );
  }

  @Patch('medicines/:id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateMedicineDto,
  ) {
    return this.medicinesService.update(
      req.user.id,          // ✅ CAMBIO: userId → id
      Number(id),
      dto,
    );
  }

  @Delete('medicines/:id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.medicinesService.remove(
      req.user.id,          // ✅ CAMBIO: userId → id
      Number(id),
    );
  }
}