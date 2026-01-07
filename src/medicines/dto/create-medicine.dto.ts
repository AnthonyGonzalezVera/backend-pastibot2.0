import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsInt, 
  Min, 
  IsArray 
} from 'class-validator';

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
  qrData?: any;

  // 🔥 NUEVOS CAMPOS
  @IsOptional()
  @IsString()
  time?: string;     // "08:00"

  @IsOptional()
  @IsArray()
  days?: string[];   // ["Lu","Ma","Mi"]

  @IsOptional()
  @IsString()
  label?: string;
}
