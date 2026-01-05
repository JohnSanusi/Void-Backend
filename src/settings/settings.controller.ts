import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { UpdatePrivacyDto, UpdateNotificationsDto, UpdateMediaDto, UpdateThemeDto, BlockUserDto } from './dto/update-settings.dto';

@Controller('settings')
@UseGuards(AuthGuard('jwt'))
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    async getSettings(@Req() req) {
        return this.settingsService.getSettings((req as RequestWithUser).user.userId);
    }

    @Patch('privacy')
    async updatePrivacy(@Req() req, @Body() dto: UpdatePrivacyDto) {
        return this.settingsService.updatePrivacyPartial((req as RequestWithUser).user.userId, dto);
    }

    @Patch('notifications')
    async updateNotifications(@Req() req, @Body() dto: UpdateNotificationsDto) {
        return this.settingsService.updateNotifications((req as RequestWithUser).user.userId, dto);
    }

    @Patch('media')
    async updateMedia(@Req() req, @Body() dto: UpdateMediaDto) {
        return this.settingsService.updateMedia((req as RequestWithUser).user.userId, dto);
    }

    @Patch('theme')
    async updateTheme(@Req() req, @Body() dto: UpdateThemeDto) {
        return this.settingsService.updateTheme((req as RequestWithUser).user.userId, dto);
    }

    @Post('block')
    async blockUser(@Req() req, @Body() dto: BlockUserDto) {
        return this.settingsService.blockUser((req as RequestWithUser).user.userId, dto.userId);
    }

    @Delete('block/:id')
    async unblockUser(@Req() req, @Param('id') id: string) {
        return this.settingsService.unblockUser((req as RequestWithUser).user.userId, id);
    }

    @Get('blocked')
    async getBlockedUsers(@Req() req) {
        return this.settingsService.getBlockedUsers((req as RequestWithUser).user.userId);
    }

    @Delete('account')
    async deleteAccount(@Req() req) {
        return this.settingsService.deleteAccount((req as RequestWithUser).user.userId);
    }

    @Get('data')
    async downloadData(@Req() req) {
        return this.settingsService.downloadUserData((req as RequestWithUser).user.userId);
    }
}
