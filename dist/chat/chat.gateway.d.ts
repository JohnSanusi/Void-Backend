import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private chatService;
    server: Server;
    private userSocketMap;
    constructor(jwtService: JwtService, configService: ConfigService, chatService: ChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleMessage(data: {
        conversationId: string;
        content: string;
        mediaType: string;
        clientMessageId: string;
        recipientId: string;
    }, client: Socket): Promise<void>;
    handleTyping(data: {
        conversationId: string;
        recipientId: string;
        isTyping: boolean;
    }, client: Socket): void;
}
