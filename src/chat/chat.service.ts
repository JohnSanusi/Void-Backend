import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { UsersService } from '../users/users.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
        @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
        private usersService: UsersService,
    ) { }

    async findOrCreatePrivateConversation(user1Id: string, user2Id: string): Promise<ConversationDocument> {
        // Optional: Check if blocked. But maybe allow opening chat to see history.
        // If strict blocking (can't see profile/chat):
        if (!await this.usersService.canMessage(user1Id, user2Id)) {
            // throw new ForbiddenException('Cannot start conversation with blocked user');
            // For now, allow finding, block messaging.
        }

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
        // Verify conversation and blocking
        const conversation = await this.conversationModel.findById(data.conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        // Check blocking for private chats
        if (conversation.type === 'private') {
            const recipientId = conversation.participants.find(p => p.toString() !== data.senderId);
            if (recipientId) {
                const canMessage = await this.usersService.canMessage(data.senderId, recipientId.toString());
                if (!canMessage) {
                    throw new BadRequestException('Cannot send message: You are blocked or have blocked this user.');
                }
            }
        }

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

    async getConversations(userId: string): Promise<any[]> {
        return this.conversationModel
            .find({
                participants: new Types.ObjectId(userId),
                'archived.userId': { $ne: new Types.ObjectId(userId) }
            })
            .populate('participants', 'fullName avatarUrl')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .exec();
    }

    async getArchivedConversations(userId: string): Promise<any[]> {
        return this.conversationModel
            .find({
                participants: new Types.ObjectId(userId),
                'archived.userId': new Types.ObjectId(userId)
            })
            .populate('participants', 'fullName avatarUrl')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .exec();
    }

    async pinConversation(conversationId: string, userId: string): Promise<void> {
        await this.conversationModel.updateOne(
            { _id: conversationId, 'pinned.userId': { $ne: new Types.ObjectId(userId) } },
            { $push: { pinned: { userId: new Types.ObjectId(userId), pinnedAt: new Date() } } }
        );
    }

    async unpinConversation(conversationId: string, userId: string): Promise<void> {
        await this.conversationModel.updateOne(
            { _id: conversationId },
            { $pull: { pinned: { userId: new Types.ObjectId(userId) } } }
        );
    }

    async muteConversation(conversationId: string, userId: string, mutedUntil?: Date): Promise<void> {
        // Remove existing mute first (cleaner than complex update logic)
        await this.unmuteConversation(conversationId, userId);
        await this.conversationModel.updateOne(
            { _id: conversationId },
            { $push: { muted: { userId: new Types.ObjectId(userId), mutedUntil: mutedUntil || new Date(2099, 0, 1) } } }
        );
    }

    async unmuteConversation(conversationId: string, userId: string): Promise<void> {
        await this.conversationModel.updateOne(
            { _id: conversationId },
            { $pull: { muted: { userId: new Types.ObjectId(userId) } } }
        );
    }

    async archiveConversation(conversationId: string, userId: string): Promise<void> {
        await this.conversationModel.updateOne(
            { _id: conversationId, 'archived.userId': { $ne: new Types.ObjectId(userId) } },
            { $push: { archived: { userId: new Types.ObjectId(userId), archivedAt: new Date() } } }
        );
    }

    async unarchiveConversation(conversationId: string, userId: string): Promise<void> {
        await this.conversationModel.updateOne(
            { _id: conversationId },
            { $pull: { archived: { userId: new Types.ObjectId(userId) } } }
        );
    }

    async markAsUnread(conversationId: string, userId: string): Promise<void> {
        // Remove from readStatus locally? Or add to separate unreadMarked array?
        // Schema has `unreadMarked` array.
        await this.conversationModel.updateOne(
            { _id: conversationId, 'unreadMarked.userId': { $ne: new Types.ObjectId(userId) } },
            { $push: { unreadMarked: { userId: new Types.ObjectId(userId) } } }
        );
    }

    async markAsRead(conversationId: string, userId: string, messageId: string): Promise<void> {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        // Remove manual unread mark if exists
        const unreadIndex = conversation.unreadMarked?.findIndex(u => u.userId.toString() === userId);
        if (unreadIndex > -1) {
            conversation.unreadMarked.splice(unreadIndex, 1);
        }

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

}
