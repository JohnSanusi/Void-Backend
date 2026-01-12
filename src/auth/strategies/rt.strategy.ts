import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') || 'rt_secret',
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: { sub: string; email: string },
  ): { sub: string; email: string; refreshToken: string } {
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader
      ? authHeader.replace('Bearer', '').trim()
      : '';
    return { ...payload, refreshToken };
  }
}
