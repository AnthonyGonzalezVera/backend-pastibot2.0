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
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreatePatientDto) {
    return this.patientsService.create(req.user.id, dto); // ✅ CAMBIO: userId → id
  }

  @Get()
  findAll(@Req() req: any) {
    return this.patientsService.findAllForCaregiver(req.user.id); // ✅ CAMBIO: userId → id
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.patientsService.findOneForCaregiver(
      req.user.id, // ✅ CAMBIO: userId → id
      Number(id),
    );
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientsService.update(
      req.user.id, // ✅ CAMBIO: userId → id
      Number(id),
      dto,
    );
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.patientsService.remove(req.user.id, Number(id)); // ✅ CAMBIO: userId → id
  }
}