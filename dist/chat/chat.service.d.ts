import { Model } from 'mongoose';
import { ConversationDocument } from './schemas/conversation.schema';
import { MessageDocument } from './schemas/message.schema';
export declare class ChatService {
    private conversationModel;
    private messageModel;
    constructor(conversationModel: Model<ConversationDocument>, messageModel: Model<MessageDocument>);
    findOrCreatePrivateConversation(user1Id: string, user2Id: string): Promise<ConversationDocument>;
    saveMessage(data: {
        conversationId: string;
        senderId: string;
        clientMessageId: string;
        content: string;
        mediaType: string;
    }): Promise<MessageDocument>;
    getMessages(conversationId: string, limit?: number, beforeId?: string): Promise<MessageDocument[]>;
    markAsRead(conversationId: string, userId: string, messageId: string): Promise<void>;
    getConversations(userId: string): Promise<any[]>;
}
