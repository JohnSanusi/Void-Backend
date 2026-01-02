import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUsersService = () => ({
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
});

const mockJwtService = () => ({
    signAsync: jest.fn(),
});

const mockConfigService = () => ({
    get: jest.fn(),
});

describe('AuthService', () => {
    let service: AuthService;
    let usersService: any;
    let jwtService: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useFactory: mockUsersService },
                { provide: JwtService, useFactory: mockJwtService },
                { provide: ConfigService, useFactory: mockConfigService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateGoogleUser', () => {
        it('should throw UnauthorizedException if email is not verified', async () => {
            const payload = { email_verified: false };
            await expect(service.validateGoogleUser(payload)).rejects.toThrow(UnauthorizedException);
        });

        it('should create a user and return tokens if user does not exist', async () => {
            const payload = {
                email: 'test@gmail.com',
                firstName: 'Test',
                lastName: 'User',
                picture: 'pic.jpg',
                sub: 'googleId123',
                email_verified: true,
            };

            usersService.findByEmail.mockResolvedValue(null);
            usersService.create.mockResolvedValue({ _id: 'userId', email: payload.email });
            jwtService.signAsync.mockResolvedValue('token');

            const result = await service.validateGoogleUser(payload);

            expect(usersService.create).toHaveBeenCalled();
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });
    });

    describe('refreshTokens', () => {
        it('should throw UnauthorizedException if user has no refresh token hash', async () => {
            usersService.findById.mockResolvedValue({ refreshTokenHash: null });
            await expect(service.refreshTokens('userId', 'token')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if refresh token does not match', async () => {
            const storedHash = await bcrypt.hash('different_token', 10);
            usersService.findById.mockResolvedValue({ refreshTokenHash: storedHash });
            await expect(service.refreshTokens('userId', 'token')).rejects.toThrow(UnauthorizedException);
        });
    });
});
