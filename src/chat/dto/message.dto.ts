import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsString()
  @IsNotEmpty()
  mediaType: string;

  @IsString()
  @IsNotEmpty()
  clientMessageId: string;

  @IsString()
  @IsNotEmpty()
  recipientId: string;
}

export class MarkReadDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  messageId: string;
}
