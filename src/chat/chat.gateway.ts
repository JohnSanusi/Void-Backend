import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { MessageDocument } from './schemas/message.schema';

interface CustomSocket extends Socket {
    data: {
        userId: string;
    };
}

@WebSocketGateway({
    namespace: 'chat',
    cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // In-memory mapping of User ID -> Socket ID
    private userSocketMap = new Map<string, string>();

    // Typing throttle map: userId -> lastTimestamp
    private lastTypingEmit = new Map<string, number>();

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private chatService: ChatService,
    ) { }

    async handleConnection(client: CustomSocket) {
        try {
            const authHeader = client.handshake.headers.authorization;
            const token = (client.handshake.auth?.token as string | undefined) || (authHeader ? authHeader.split(' ')[1] : undefined);
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync<{ sub: string; email: string }>(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });

            const userId = payload.sub;
            client.data.userId = userId;
            this.userSocketMap.set(userId, client.id);

            // Join a room specific to the user for easy targeting
            await client.join(`user_${userId}`);

            console.log(`User connected: ${userId}`);
        } catch (err) {
            console.error('Socket connection error:', err);
            client.disconnect();
        }
    }

    handleDisconnect(client: CustomSocket) {
        const userId = client.data.userId;
        if (userId) {
            this.userSocketMap.delete(userId);
            console.log(`User disconnected: ${userId}`);
        }
    }

    @SubscribeMessage('send_message')
    async handleMessage(
        @MessageBody() data: { conversationId: string; content: string; mediaType: string; clientMessageId: string; recipientId: string },
        @ConnectedSocket() client: CustomSocket,
    ) {
        const senderId = client.data.userId;

        // 1. Immediate ACK to sender (Non-blocking)
        client.emit('message_received_by_server', { clientMessageId: data.clientMessageId });

        try {
            // 2. Persist to DB Asynchronously
            const savedMessage = await this.chatService.saveMessage({
                conversationId: data.conversationId,
                senderId,
                clientMessageId: data.clientMessageId,
                content: data.content,
                mediaType: data.mediaType,
            });

            // 3. Deliver to recipient if online
            this.server.to(`user_${data.recipientId}`).emit('new_message', savedMessage);

            // Notify sender of delivery
            const msgId = (savedMessage as MessageDocument)._id.toString();
            client.emit('message_status_update', {
                messageId: msgId,
                status: 'delivered'
            });
        } catch (err) {
            console.error('Failed to save message:', err);
            client.emit('message_error', {
                clientMessageId: data.clientMessageId,
                error: err.message || 'Failed to send message'
            });
        }
    }

    @SubscribeMessage('typing_status')
    handleTyping(
        @MessageBody() data: { conversationId: string; recipientId: string; isTyping: boolean },
        @ConnectedSocket() client: CustomSocket,
    ) {
        const userId = client.data.userId;
        const now = Date.now();
        const lastEmit = this.lastTypingEmit.get(userId) || 0;

        // Throttle: Max 1 event per 2 seconds, unless stopping typing (immediate)
        if (data.isTyping && now - lastEmit < 2000) {
            return;
        }

        this.lastTypingEmit.set(userId, now);

        this.server.to(`user_${data.recipientId}`).emit('user_typing_update', {
            conversationId: data.conversationId,
            userId,
            isTyping: data.isTyping,
        });
    }
}
