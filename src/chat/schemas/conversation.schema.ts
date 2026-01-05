import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema()
class ReadStatus {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Message' })
    lastReadMessageId: Types.ObjectId;

    @Prop()
    lastReadAt: Date;
}

const ReadStatusSchema = SchemaFactory.createForClass(ReadStatus);

@Schema({ timestamps: true })
export class Conversation {
    @Prop({ required: true, enum: ['private', 'group'], default: 'private' })
    type: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], index: true })
    participants: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: 'Message' })
    lastMessage: Types.ObjectId;

    @Prop({ type: [ReadStatusSchema], default: [] })
    readStatus: ReadStatus[];

    @Prop({ type: Object })
    metadata: {
        name?: string;
        groupAvatar?: string;
    };

    @Prop({ type: [{ userId: Types.ObjectId, pinnedAt: Date }], default: [] })
    pinned: { userId: Types.ObjectId; pinnedAt: Date }[];

    @Prop({ type: [{ userId: Types.ObjectId, mutedUntil: Date }], default: [] })
    muted: { userId: Types.ObjectId; mutedUntil: Date }[];

    @Prop({ type: [{ userId: Types.ObjectId, archivedAt: Date }], default: [] })
    archived: { userId: Types.ObjectId; archivedAt: Date }[];

    @Prop({ type: [{ userId: Types.ObjectId }], default: [] })
    unreadMarked: { userId: Types.ObjectId }[];

    @Prop()
    updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Ensure updatedAt is indexed for fast listing
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ 'pinned.userId': 1 });
ConversationSchema.index({ 'archived.userId': 1 });
ConversationSchema.index({ 'muted.userId': 1 });
