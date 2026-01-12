import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true, index: true })
  clientMessageId: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    required: true,
    enum: ['text', 'image', 'video', 'voice'],
    default: 'text',
  })
  mediaType: string;

  @Prop({
    required: true,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Compound index for fast conversation retrieval
MessageSchema.index({ conversationId: 1, createdAt: -1 });
