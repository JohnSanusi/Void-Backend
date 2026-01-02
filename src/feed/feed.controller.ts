import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { FeedService } from './feed.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('feed')
@UseGuards(AuthGuard('jwt'))
export class FeedController {
    constructor(private readonly feedService: FeedService) { }

    @Post('posts')
    async createPost(@Req() req, @Body() data: any) {
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
    async toggleLike(@Req() req, @Param('id') id: string) {
        return this.feedService.toggleLike(id, req.user.userId);
    }
}
