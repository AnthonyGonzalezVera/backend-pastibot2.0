import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateMedicineDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  dosage: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsOptional()
  qrData?: any; // puede ser un objeto JSON
}
