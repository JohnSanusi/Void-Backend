import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StatusDocument = Status & Document;

@Schema()
class ViewerRecord {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: Date.now })
  seenAt: Date;
}

const ViewerRecordSchema = SchemaFactory.createForClass(ViewerRecord);

@Schema({ timestamps: true })
export class Status {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  mediaUrl: string;

  @Prop({ required: true, enum: ['image', 'video'] })
  type: string;

  @Prop({
    type: { count: Number, list: [ViewerRecordSchema] },
    default: { count: 0, list: [] },
  })
  viewers: {
    count: number;
    list: ViewerRecord[];
  };

  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const StatusSchema = SchemaFactory.createForClass(Status);
