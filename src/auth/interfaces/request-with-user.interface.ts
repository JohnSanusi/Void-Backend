import { Request } from 'express';

export interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
        sub?: string;
        refreshToken?: string;
    };
}

export interface RequestWithGoogleUser extends Request {
    user: {
        email: string;
        firstName: string;
        lastName: string;
        picture: string;
        sub: string;
        email_verified: boolean;
        accessToken: string;
    };
}
