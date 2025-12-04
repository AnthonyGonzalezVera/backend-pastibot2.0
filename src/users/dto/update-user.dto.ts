import { IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsUrl({}, { message: 'photoUrl debe ser una URL valida'})
    photoUrl?: string;
}