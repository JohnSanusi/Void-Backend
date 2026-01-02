"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("./schemas/conversation.schema");
const message_schema_1 = require("./schemas/message.schema");
let ChatService = class ChatService {
    conversationModel;
    messageModel;
    constructor(conversationModel, messageModel) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
    }
    async findOrCreatePrivateConversation(user1Id, user2Id) {
        const participants = [new mongoose_2.Types.ObjectId(user1Id), new mongoose_2.Types.ObjectId(user2Id)].sort();
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
    async saveMessage(data) {
        const message = new this.messageModel({
            conversationId: new mongoose_2.Types.ObjectId(data.conversationId),
            senderId: new mongoose_2.Types.ObjectId(data.senderId),
            clientMessageId: data.clientMessageId,
            content: data.content,
            mediaType: data.mediaType,
            status: 'sent',
            createdAt: new Date(),
        });
        await message.save();
        await this.conversationModel.findByIdAndUpdate(data.conversationId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });
        return message;
    }
    async getMessages(conversationId, limit = 50, beforeId) {
        const query = { conversationId: new mongoose_2.Types.ObjectId(conversationId) };
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
    async markAsRead(conversationId, userId, messageId) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        const readStatusIndex = conversation.readStatus.findIndex((status) => status.userId.toString() === userId);
        const update = {
            userId: new mongoose_2.Types.ObjectId(userId),
            lastReadMessageId: new mongoose_2.Types.ObjectId(messageId),
            lastReadAt: new Date(),
        };
        if (readStatusIndex > -1) {
            conversation.readStatus[readStatusIndex] = update;
        }
        else {
            conversation.readStatus.push(update);
        }
        await conversation.save();
    }
    async getConversations(userId) {
        return this.conversationModel
            .find({ participants: new mongoose_2.Types.ObjectId(userId) })
            .populate('participants', 'fullName avatarUrl')
            .populate('lastMessage')
            .sort({ updatedAt: -1 })
            .exec();
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map