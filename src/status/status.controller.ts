import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { StatusService } from './status.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('status')
@UseGuards(AuthGuard('jwt'))
export class StatusController {
    constructor(private readonly statusService: StatusService) { }

    @Post()
    async createStatus(@Req() req, @Body() data: { mediaUrl: string; type: string }) {
        return this.statusService.createStatus(req.user.userId, data);
    }

    @Get('active')
    async getActiveStatuses(@Req() req) {
        // In a real app, you'd fetch the user's following list first.
        // Assuming for MVP we pass a list or just fetch from all contacts.
        // Mocking for now: fetching from contacts if available in User schema.
        const user = req.user; // User object from JWT validate()
        // For MVP, letting user see statuses from specific IDs or just a general pool
        return this.statusService.getActiveStatuses([]); // To be refined with follower logic
    }

    @Post(':id/view')
    async viewStatus(@Req() req, @Param('id') id: string) {
        return this.statusService.viewStatus(id, req.user.userId);
    }

    @Get('me')
    async getMyStatuses(@Req() req) {
        return this.statusService.getMyStatuses(req.user.userId);
    }
}
