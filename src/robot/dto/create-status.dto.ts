import { IsBoolean, IsInt, IsIn, Max, Min } from 'class-validator';

export class CreateStatusDto {
  @IsIn(['OK', 'DISPENSANDO', 'ERROR'])
  status: 'OK' | 'DISPENSANDO' | 'ERROR';

  @IsBoolean()
  wifi: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  batteryPct: number;
}
