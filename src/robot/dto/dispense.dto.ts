import { IsInt, Min } from 'class-validator';

export class DispenseDto {
  @IsInt()
  @Min(1)
  medicineId: number;

  @IsInt()
  @Min(1)
  amount: number; // cantidad de pastillas a dispensar
}
