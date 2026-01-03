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
    handleMessage(
        @MessageBody() data: { conversationId: string; content: string; mediaType: string; clientMessageId: string; recipientId: string },
        @ConnectedSocket() client: CustomSocket,
    ) {
        const senderId = client.data.userId;

        // 1. Immediate ACK to sender (Non-blocking)
        client.emit('message_received_by_server', { clientMessageId: data.clientMessageId });

        // 2. Persist to DB Asynchronously
        void this.chatService.saveMessage({
            conversationId: data.conversationId,
            senderId,
            clientMessageId: data.clientMessageId,
            content: data.content,
            mediaType: data.mediaType,
        }).then(savedMessage => {
            // 3. Deliver to recipient if online
            const msg = savedMessage as any;
            this.server.to(`user_${data.recipientId}`).emit('new_message', savedMessage);

            // Notify sender of delivery (mock logic for "delivered" status)
            // In a real app, 'delivered' would come from recipient's socket ack
            client.emit('message_status_update', { messageId: msg._id, status: 'delivered' });
        }).catch(err => {
            console.error('Failed to save message:', err);
        });
    }

    @SubscribeMessage('typing_status')
    handleTyping(
        @MessageBody() data: { conversationId: string; recipientId: string; isTyping: boolean },
        @ConnectedSocket() client: CustomSocket,
    ) {
        const userId = client.data.userId;
        this.server.to(`user_${data.recipientId}`).emit('user_typing_update', {
            conversationId: data.conversationId,
            userId,
            isTyping: data.isTyping,
        });
    }
}
