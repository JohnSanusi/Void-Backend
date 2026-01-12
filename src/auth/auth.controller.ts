import { Controller, Post, Get, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type {
  RequestWithUser,
  RequestWithGoogleUser,
} from './interfaces/request-with-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: RequestWithGoogleUser) {
    const tokens = await this.authService.validateGoogleUser(req.user);
    // In a real app, you might redirect to the mobile app with tokens in the URL
    // or return them if this is called from a web popup.
    return tokens;
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refreshTokens(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return await this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Req() req: RequestWithUser) {
    await this.authService.logout(req.user.userId);
  }
}
