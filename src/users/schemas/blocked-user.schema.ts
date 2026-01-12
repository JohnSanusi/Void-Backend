import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlockedUserDocument = BlockedUser & Document;

@Schema({ timestamps: true })
export class BlockedUser {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  blockerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  blockedId: Types.ObjectId;
}

export const BlockedUserSchema = SchemaFactory.createForClass(BlockedUser);

// Ensure unique compound index so A can't block B twice
BlockedUserSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
