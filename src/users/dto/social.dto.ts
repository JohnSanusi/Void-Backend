import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsBoolean()
    isPrivate?: boolean;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    fullName?: string;
}

export class ManageRequestDto {
    @IsString()
    requesterId: string;

    @IsBoolean()
    accept: boolean;
}
