import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DispenseRequestDto {
    @IsInt()
    @IsNotEmpty()
    medicineId: number;

    @IsOptional()
    @IsInt()
    amount?: number;
}
