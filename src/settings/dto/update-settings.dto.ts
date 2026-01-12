import { IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdatePrivacyDto {
  @IsOptional()
  @IsEnum(['everyone', 'contacts', 'nobody'])
  lastSeenVisibility?: string;

  @IsOptional()
  @IsEnum(['everyone', 'contacts', 'nobody'])
  profilePhotoVisibility?: string;

  @IsOptional()
  @IsEnum(['everyone', 'contacts', 'nobody'])
  statusVisibility?: string;
}

export class UpdateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  globalMute?: boolean;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;
}

export class UpdateMediaDto {
  @IsOptional()
  @IsEnum(['wifi', 'wifi_cellular', 'never'])
  autoDownload?: string;

  @IsOptional()
  @IsBoolean()
  mediaVisibility?: boolean;
}

export class UpdateThemeDto {
  @IsEnum(['light', 'dark', 'system'])
  theme: string;
}

export class BlockUserDto {
  @IsString()
  userId: string;
}
