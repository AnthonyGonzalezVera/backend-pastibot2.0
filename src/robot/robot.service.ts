import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatusDto } from './dto/create-status.dto';
import { DispenseDto } from './dto/dispense.dto';
import { DispensedDto } from './dto/dispensed.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RobotService {
  private readonly logger = new Logger(RobotService.name);

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  /**
   * El ESP32 envía su estado actual (batería, wifi, estado)
   */
  async reportStatus(dto: CreateStatusDto) {
    const state = await this.prisma.robotState.create({
      data: {
        status: dto.status,
        wifi: dto.wifi,
        batteryPct: dto.batteryPct,
      },
    });

    return state;
  }

  /**
   * Devuelve el último estado conocido del robot
   */
  async getLatestStatus() {
    const state = await this.prisma.robotState.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return state;
  }

  /**
   * El frontend pide dispensar pastillas.
   * Aquí NestJS llama al ESP32 vía HTTP.
   */
  async requestDispense(dto: DispenseDto) {
    const baseUrl = process.env.ESP32_URL || 'http://192.168.0.50';

    try {
      // Llamada al ESP32
      const response$ = this.http.post(`${baseUrl}/dispense`, {
        medicineId: dto.medicineId,
        amount: dto.amount,
      });

      const response = await firstValueFrom(response$);

      // Guardamos un log simple
      await this.prisma.robotLog.create({
        data: {
          medicineId: dto.medicineId,
          message: `Solicitud de dispensación enviada al ESP32 (amount=${dto.amount})`,
        },
      });

      return {
        ok: true,
        fromEsp32: response.data,
      };
    } catch (error) {
      this.logger.error('Error llamando al ESP32 /dispense', error?.message);

      await this.prisma.robotLog.create({
        data: {
          medicineId: dto.medicineId,
          message: `Error al llamar al ESP32: ${error?.message || 'desconocido'}`,
        },
      });

      throw new InternalServerErrorException('No se pudo comunicar con el ESP32');
    }
  }

  /**
   * El ESP32 confirma que ya dispensó las pastillas.
   */
  async confirmDispensed(dto: DispensedDto) {
    const message =
      dto.message ||
      `Robot reporta dispensado medicineId=${dto.medicineId ?? 'N/A'}, amount=${dto.amount ?? 'N/A'}, time=${dto.time ?? 'N/A'}`;

    const log = await this.prisma.robotLog.create({
      data: {
        medicineId: dto.medicineId ?? null,
        message,
      },
    });

    return log;
  }

  /**
   * (Opcional) Listar logs del robot
   */
  async getLogs(limit = 20) {
    return this.prisma.robotLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}
