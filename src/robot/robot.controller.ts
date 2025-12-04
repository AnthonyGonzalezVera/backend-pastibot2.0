import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RobotService } from './robot.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { DispenseDto } from './dto/dispense.dto';
import { DispensedDto } from './dto/dispensed.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('robot')
export class RobotController {
  constructor(private readonly robotService: RobotService) {}

  /**
   * [ESP32 → Backend]
   * El ESP32 manda su estado (OK / DISPENSANDO / ERROR, wifi, batería)
   * NO protegemos con JWT, pero podrías añadir un token simple en cabecera si quieres.
   */
  @Post('status')
  reportStatus(@Body() dto: CreateStatusDto) {
    return this.robotService.reportStatus(dto);
  }

  /**
   * [Frontend → Backend]
   * Obtener el último estado del robot.
   * Protegido con JWT porque lo consulta la app.
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  getLatestStatus() {
    return this.robotService.getLatestStatus();
  }

  /**
   * [Frontend → Backend → ESP32]
   * Pedir que el robot dispense pastillas.
   * La app llama aquí, y aquí se llama al ESP32.
   */
  @UseGuards(JwtAuthGuard)
  @Post('dispense')
  requestDispense(@Body() dto: DispenseDto) {
    return this.robotService.requestDispense(dto);
  }

  /**
   * [ESP32 → Backend]
   * El ESP32 confirma que ya dispensó.
   */
  @Post('dispensed')
  confirmDispensed(@Body() dto: DispensedDto) {
    return this.robotService.confirmDispensed(dto);
  }

  /**
   * (Opcional) Ver últimos logs del robot.
   * Útil para debug en la app o en un panel admin.
   */
  @UseGuards(JwtAuthGuard)
  @Get('logs')
  getLogs(@Query('limit') limit?: string) {
    const n = limit ? Number(limit) : 20;
    return this.robotService.getLogs(n);
  }
}
