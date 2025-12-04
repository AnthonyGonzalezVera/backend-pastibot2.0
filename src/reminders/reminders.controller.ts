import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post('medicines/:medicineId/reminders')
  create(
    @Param('medicineId') medicineId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return this.remindersService.createForMedicine(Number(medicineId), dto);
  }

  @Get('medicines/:medicineId/reminders')
  findAll(@Param('medicineId') medicineId: string) {
    return this.remindersService.findAllForMedicine(Number(medicineId));
  }

  @Patch('reminders/:id')
  update(@Param('id') id: string, @Body() dto: UpdateReminderDto) {
    return this.remindersService.update(Number(id), dto);
  }

  @Delete('reminders/:id')
  remove(@Param('id') id: string) {
    return this.remindersService.remove(Number(id));
  }
}
