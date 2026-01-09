import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    UseGuards,
    Query,
    BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { DispenseRequestDto } from './dto/dispense-request.dto';
import { RobotService } from '../robot/robot.service';

@Controller('my')
@UseGuards(JwtAuthGuard)
export class PatientDataController {
    constructor(
        private prisma: PrismaService,
        private robotService: RobotService,
    ) { }

    // =====================================================
    // GET MY MEDICINES (Patient's assigned medicines)
    // =====================================================
    @Get('medicines')
    async getMyMedicines(@Req() req: any) {
        const userId = req.user.id;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user?.email) return [];

        const patient = await this.prisma.patient.findUnique({
            where: { email: user.email },
            include: { medicines: true },
        });

        return patient?.medicines || [];
    }

    // =====================================================
    // GET TODAY'S REMINDERS
    // =====================================================
    @Get('reminders')
    async getMyReminders(@Req() req: any) {
        const userId = req.user.id;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.email) return [];

        const patient = await this.prisma.patient.findUnique({
            where: { email: user.email },
            include: {
                medicines: {
                    include: { reminders: true },
                },
            },
        });

        if (!patient) return [];

        const today = new Date();
        const dayNames = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
        const todayName = dayNames[today.getDay()];

        const reminders: any[] = [];
        for (const med of patient.medicines) {
            for (const rem of med.reminders) {
                const days = rem.days ? rem.days.split(',') : [];
                if (rem.active && (days.length === 0 || days.includes(todayName))) {
                    reminders.push({
                        ...rem,
                        medicineId: med.id,
                        medicineName: med.name,
                        medicineDosage: med.dosage,
                    });
                }
            }
        }

        return reminders.sort((a, b) => a.time.localeCompare(b.time));
    }

    // =====================================================
    // GET DISPENSATION HISTORY
    // =====================================================
    @Get('history')
    async getMyHistory(@Req() req: any, @Query('days') days?: string) {
        const userId = req.user.id;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.email) return [];

        const patient = await this.prisma.patient.findUnique({
            where: { email: user.email },
        });

        if (!patient) return [];

        const daysBack = days ? parseInt(days) : 7;
        const since = new Date();
        since.setDate(since.getDate() - daysBack);

        const logs = await this.prisma.dispensationLog.findMany({
            where: {
                patientId: patient.id,
                dispensedAt: { gte: since },
            },
            include: { medicine: true },
            orderBy: { dispensedAt: 'desc' },
        });

        return logs;
    }

    // =====================================================
    // GET ROBOT STATUS
    // =====================================================
    @Get('robot')
    async getMyRobotStatus() {
        return this.robotService.getLatestStatus();
    }

    // =====================================================
    // REQUEST DISPENSE
    // =====================================================
    @Post('dispense')
    async requestDispense(@Req() req: any, @Body() dto: DispenseRequestDto) {
        const userId = req.user.id;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user?.email) {
            throw new BadRequestException('Usuario no válido');
        }

        const patient = await this.prisma.patient.findUnique({
            where: { email: user.email },
        });

        if (!patient) {
            throw new BadRequestException('Paciente no encontrado');
        }

        const medicine = await this.prisma.medicine.findFirst({
            where: {
                id: dto.medicineId,
                patientId: patient.id,
            },
        });

        if (!medicine) {
            return { ok: false, message: 'Medicamento no encontrado' };
        }

        try {
            const result = await this.robotService.requestDispense({
                medicineId: dto.medicineId,
                amount: dto.amount || 1,
            });

            await this.prisma.dispensationLog.create({
                data: {
                    medicineId: dto.medicineId,
                    patientId: patient.id,
                    status: 'DISPENSED',
                },
            });

            if (medicine.stock && medicine.stock > 0) {
                await this.prisma.medicine.update({
                    where: { id: dto.medicineId },
                    data: { stock: medicine.stock - (dto.amount || 1) },
                });
            }

            return result;
        } catch {
            return { ok: false, message: 'Error al dispensar' };
        }
    }

    // =====================================================
    // MARK AS TAKEN
    // =====================================================
    @Post('taken')
    async markAsTaken(@Body('dispensationId') dispensationId: number) {
        if (!dispensationId) {
            throw new BadRequestException('dispensationId es requerido');
        }

        await this.prisma.dispensationLog.update({
            where: { id: dispensationId },
            data: { status: 'TAKEN' },
        });

        return { ok: true };
    }
}
