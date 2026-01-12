import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class PrivacySettings {
  @Prop({ default: 'everyone', enum: ['everyone', 'contacts', 'nobody'] })
  lastSeenVisibility: string;

  @Prop({ default: 'everyone', enum: ['everyone', 'contacts', 'nobody'] })
  profilePhotoVisibility: string;

  @Prop({ default: 'everyone', enum: ['everyone', 'contacts', 'nobody'] })
  statusVisibility: string;
}

@Schema({ _id: false })
export class NotificationSettings {
  @Prop({ default: false })
  globalMute: boolean;

  @Prop({ default: true })
  pushEnabled: boolean;
}

@Schema({ _id: false })
export class MediaSettings {
  @Prop({ default: 'wifi', enum: ['wifi', 'wifi_cellular', 'never'] })
  autoDownload: string;

  @Prop({ default: true })
  mediaVisibility: boolean;
}

@Schema({ _id: false })
export class UserSettings {
  @Prop({ type: PrivacySettings, default: () => ({}) })
  privacy: PrivacySettings;

  @Prop({ type: NotificationSettings, default: () => ({}) })
  notifications: NotificationSettings;

  @Prop({ type: MediaSettings, default: () => ({}) })
  media: MediaSettings;

  @Prop({ default: 'system', enum: ['light', 'dark', 'system'] })
  theme: string;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
