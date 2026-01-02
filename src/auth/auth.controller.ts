import { Controller, Post, Get, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req) {
        const tokens = await this.authService.validateGoogleUser(req.user);
        // In a real app, you might redirect to the mobile app with tokens in the URL
        // or return them if this is called from a web popup.
        return tokens;
    }

    @UseGuards(AuthGuard('jwt-refresh'))
    @Post('refresh')
    refreshTokens(@Req() req: Request) {
        const userId = req.user['sub'];
        const refreshToken = req.user['refreshToken'];
        return this.authService.refreshTokens(userId, refreshToken);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    logout(@Req() req: Request) {
        this.authService.logout(req.user['userId']);
    }
}
