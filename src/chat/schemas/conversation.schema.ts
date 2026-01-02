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

    @Prop()
    updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Ensure updatedAt is indexed for fast listing
ConversationSchema.index({ updatedAt: -1 });
