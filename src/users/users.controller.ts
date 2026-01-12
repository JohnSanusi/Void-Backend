import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { UpdateProfileDto, ManageRequestDto } from './dto/social.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get('requests')
  async getRequests(@Req() req: RequestWithUser) {
    return this.usersService.getFollowRequests(req.user.userId);
  }

  @Post(':id/follow')
  async follow(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.usersService.followUser(req.user.userId, id);
  }

  @Delete(':id/follow')
  async unfollow(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.usersService.unfollowUser(req.user.userId, id);
  }

  @Post('requests/manage')
  async manageRequest(
    @Req() req: RequestWithUser,
    @Body() dto: ManageRequestDto,
  ) {
    return this.usersService.handleFollowRequest(
      req.user.userId,
      dto.requesterId,
      dto.accept,
    );
  }

  @Get(':id')
  async getProfile(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.usersService.getProfile(req.user.userId, id);
  }
}
