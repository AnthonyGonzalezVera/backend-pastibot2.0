import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class DispensedDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  medicineId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  time?: string; // "2025-11-24 20:32"

  @IsOptional()
  @IsString()
  message?: string;
}
