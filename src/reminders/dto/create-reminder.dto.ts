import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReminderDto {
  @IsNotEmpty()
  @IsString()
  time: string; // "08:00 AM"

  @IsOptional()
  @IsString()
  days?: string; // "Lu,Ma,Mi,Ju,Vi"

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  repeat?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
