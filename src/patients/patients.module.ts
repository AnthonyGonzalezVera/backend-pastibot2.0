import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientDataController } from './patient-data.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RobotModule } from '../robot/robot.module';

@Module({
  imports: [PrismaModule, RobotModule],
  controllers: [PatientsController, PatientDataController],
  providers: [PatientsService],
})
export class PatientsModule { }
