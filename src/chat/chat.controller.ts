import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('conversations')
    async getConversations(@Req() req: RequestWithUser) {
        return this.chatService.getConversations(req.user.userId);
    }

    @Get('messages/:conversationId')
    async getMessages(
        @Param('conversationId') conversationId: string,
        @Query('limit') limit: number,
        @Query('beforeId') beforeId: string,
    ) {
        return this.chatService.getMessages(conversationId, limit, beforeId);
    }

    @Post('mark-read')
    async markRead(@Req() req: RequestWithUser, @Body() body: { conversationId: string; messageId: string }) {
        return this.chatService.markAsRead(body.conversationId, req.user.userId, body.messageId);
    }
}
