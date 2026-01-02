import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  fullName: string;

  @Prop()
  avatarUrl: string;

  @Prop({ sparse: true, index: true })
  googleId?: string;

  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop()
  lastSeen: Date;

  @Prop({ type: [String], enum: ['local', 'google'], default: ['local'] })
  providers: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  contacts: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
