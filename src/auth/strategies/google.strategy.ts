import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        } as any);
    }

    validate(
        accessToken: string,
        refreshToken: string,
        profile: {
            id: string;
            emails: { value: string; verified: boolean }[];
            name: { givenName: string; familyName: string };
            photos: { value: string }[];
        },
        done: VerifyCallback,
    ): void {
        const { name, emails, photos, id } = profile;
        const user = {
            sub: id,
            email: emails[0].value,
            email_verified: emails[0].verified,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
            accessToken,
        };
        done(null, user);
    }
}
