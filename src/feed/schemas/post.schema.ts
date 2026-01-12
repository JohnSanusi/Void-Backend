import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId;

  @Prop()
  content: string;

  @Prop({ type: [String], default: [] })
  mediaUrls: string[];

  @Prop({ required: true, enum: ['post', 'reel'], index: true })
  type: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  commentsCount: number;

  @Prop({ required: true, enum: ['public', 'followers'], default: 'public' })
  visibility: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Index for cursor-based pagination
PostSchema.index({ createdAt: -1, _id: -1 });
// Text index for basic search
PostSchema.index({ content: 'text' });
