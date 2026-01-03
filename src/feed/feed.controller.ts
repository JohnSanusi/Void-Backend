import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { FeedService } from './feed.service';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('feed')
@UseGuards(AuthGuard('jwt'))
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Post('posts')
    async createPost(@Req() req: RequestWithUser, @Body() data: { content: string; mediaUrls?: string[]; type: 'post' | 'reel'; visibility?: 'public' | 'followers' }) {
        return this.feedService.createPost(req.user.userId, data);
    }

    @Get()
    async getFeed(
        @Query('limit') limit: number,
        @Query('lastId') lastId: string,
        @Query('lastCreatedAt') lastCreatedAt: string,
    ) {
        return this.feedService.getFeed(
            limit ? Number(limit) : 20,
            lastId,
            lastCreatedAt ? new Date(lastCreatedAt) : undefined,
        );
    }

    @Get('reels')
    async getReels(
        @Query('limit') limit: number,
        @Query('lastId') lastId: string,
        @Query('lastCreatedAt') lastCreatedAt: string,
    ) {
        return this.feedService.getReels(
            limit ? Number(limit) : 10,
            lastId,
            lastCreatedAt ? new Date(lastCreatedAt) : undefined,
        );
    }

    @Post('posts/:id/like')
    async toggleLike(@Req() req: RequestWithUser, @Param('id') id: string) {
        return this.feedService.toggleLike(id);
    }
}
