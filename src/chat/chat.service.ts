import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    ) { }

    async findOrCreatePrivateConversation(user1Id: string, user2Id: string): Promise<ConversationDocument> {
        const participants = [new Types.ObjectId(user1Id), new Types.ObjectId(user2Id)].sort();

        let conversation = await this.conversationModel.findOne({
            type: 'private',
            participants: { $all: participants },
        });

        if (!conversation) {
            conversation = new this.conversationModel({
                type: 'private',
                participants,
                updatedAt: new Date(),
            });
            await conversation.save();
        }

        return conversation;
    }

    async saveMessage(data: {
        conversationId: string;
        senderId: string;
        clientMessageId: string;
        content: string;
        mediaType: string;
    }): Promise<MessageDocument> {
        const message = new this.messageModel({
            conversationId: new Types.ObjectId(data.conversationId),
            senderId: new Types.ObjectId(data.senderId),
            clientMessageId: data.clientMessageId,
            content: data.content,
            mediaType: data.mediaType,
            status: 'sent',
            createdAt: new Date(),
        });

        await message.save();

        // Update conversation's last message and updatedAt (non-blocking in gateway but good for listing)
        await this.conversationModel.findByIdAndUpdate(data.conversationId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });

        return message;
    }

    async getMessages(conversationId: string, limit = 50, beforeId?: string): Promise<MessageDocument[]> {
        const query: { conversationId: Types.ObjectId; createdAt?: { $lt: Date } } = {
            conversationId: new Types.ObjectId(conversationId),
        };
        if (beforeId) {
            const beforeMessage = await this.messageModel.findById(beforeId);
            if (beforeMessage) {
                query.createdAt = { $lt: beforeMessage.createdAt };
            }
        }

        return this.messageModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    async markAsRead(conversationId: string, userId: string, messageId: string): Promise<void> {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const readStatusIndex = conversation.readStatus.findIndex(
            (status) => status.userId.toString() === userId,
        );

        const update = {
            userId: new Types.ObjectId(userId),
            lastReadMessageId: new Types.ObjectId(messageId),
            lastReadAt: new Date(),
        };

        if (readStatusIndex > -1) {
            conversation.readStatus[readStatusIndex] = update;
        } else {
            conversation.readStatus.push(update);
        }

        await conversation.save();
    }

    async getConversations(userId: string): Promise<any[]> {
        return this.conversationModel
            .find({ participants: new Types.ObjectId(userId) })
            .populate('participants', 'fullName avatarUrl')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .exec();
    }
}
