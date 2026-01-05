import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserSettings } from './user-settings.schema';

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

  @Prop({ unique: true, index: true, sparse: true })
  username: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  following: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  followRequests: Types.ObjectId[];

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;

  @Prop({ default: 0 })
  postsCount: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  contacts: Types.ObjectId[];

  @Prop({ type: UserSettings, default: () => ({}) })
  settings: UserSettings;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  blockedUsers: Types.ObjectId[];

  @Prop()
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
