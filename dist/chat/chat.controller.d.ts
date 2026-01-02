import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: any): Promise<any[]>;
    getMessages(conversationId: string, limit: number, beforeId: string): Promise<import("./schemas/message.schema").MessageDocument[]>;
    markRead(req: any, body: {
        conversationId: string;
        messageId: string;
    }): Promise<void>;
}
