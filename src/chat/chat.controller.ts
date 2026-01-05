import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Delete } from '@nestjs/common';
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

    @Get('conversations/archived')
    async getArchivedConversations(@Req() req: RequestWithUser) {
        return this.chatService.getArchivedConversations(req.user.userId);
    }

    @Post('conversations/:id/pin')
    async pinConversation(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.chatService.pinConversation(id, req.user.userId);
    }

    @Delete('conversations/:id/pin')
    async unpinConversation(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.chatService.unpinConversation(id, req.user.userId);
    }

    @Post('conversations/:id/mute')
    async muteConversation(
        @Req() req: RequestWithUser,
        @Param('id') id: string,
        @Body() body: { mutedUntil?: string }
    ) {
        return this.chatService.muteConversation(
            id,
            req.user.userId,
            body.mutedUntil ? new Date(body.mutedUntil) : undefined
        );
    }

    @Delete('conversations/:id/mute')
    async unmuteConversation(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.chatService.unmuteConversation(id, req.user.userId);
    }

    @Post('conversations/:id/archive')
    async archiveConversation(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.chatService.archiveConversation(id, req.user.userId);
    }

    @Delete('conversations/:id/archive')
    async unarchiveConversation(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.chatService.unarchiveConversation(id, req.user.userId);
    }

    @Post('conversations/:id/mark-unread')
    async markAsUnread(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.chatService.markAsUnread(id, req.user.userId);
    }
}
