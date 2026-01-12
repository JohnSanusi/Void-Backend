import { IsDateString, IsOptional } from 'class-validator';

export class MuteConversationDto {
  @IsOptional()
  @IsDateString()
  mutedUntil?: string; // If null, mute indefinitely? Or usually require a duration. Let's make it optional for "forever" or specific date.
}

// Pin and Archive don't necessarily need body if it's just a toggle or basic action,
// but creating DTOs enables extensibility.
