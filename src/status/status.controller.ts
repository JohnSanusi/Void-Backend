import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { StatusService } from './status.service';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('status')
@UseGuards(AuthGuard('jwt'))
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Post()
  async createStatus(
    @Req() req: RequestWithUser,
    @Body() data: { mediaUrl: string; type: string },
  ) {
    return this.statusService.createStatus(req.user.userId, data);
  }

  @Get('active')
  async getActiveStatuses() {
    // In a real app, you'd fetch the user's following list first.
    // For MVP, letting user see statuses from specific IDs or just a general pool
    return this.statusService.getActiveStatuses([]); // To be refined with follower logic
  }

  @Post(':id/view')
  async viewStatus(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.statusService.viewStatus(id, req.user.userId);
  }

  @Get('me')
  async getMyStatuses(@Req() req: RequestWithUser) {
    return this.statusService.getMyStatuses(req.user.userId);
  }
}
