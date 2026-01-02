import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    async findByGoogleId(googleId: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ googleId }).exec();
    }

    async create(userData: Partial<User>): Promise<UserDocument> {
        const newUser = new this.userModel(userData);
        return newUser.save();
    }

    async updateRefreshToken(userId: string | Types.ObjectId, refreshTokenHash: string | null): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash }).exec();
    }

    async updateLastSeen(userId: string | Types.ObjectId): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();
    }
}
