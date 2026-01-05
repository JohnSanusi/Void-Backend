import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { BlockedUser, BlockedUserDocument } from '../users/schemas/blocked-user.schema';
import { UpdatePrivacyDto, UpdateNotificationsDto, UpdateMediaDto, UpdateThemeDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(BlockedUser.name) private blockedUserModel: Model<BlockedUserDocument>,
    ) { }

    async getSettings(userId: string) {
        const user = await this.userModel.findById(userId).select('settings blockedUsers').lean();
        if (!user) throw new NotFoundException('User not found');
        return user.settings;
    }

    async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $set: { 'settings.privacy': { ...dto } } }, // Merge? or rewrite? Usually merge.
            // Using dot notation for partial updates if dto is partial.
            // But here dto structure matches nested.
            // Better to construct $set object for specific fields to strictly update only passed fields.
            // For now, simpler to rely on default behavior or use explicit fields.
            { new: true }
        ).select('settings');
    }

    // Helper to construct $set object
    private buildSetQuery(prefix: string, dto: Record<string, any>) {
        const query = {};
        for (const key in dto) {
            if (dto[key] !== undefined) {
                query[`${prefix}.${key}`] = dto[key];
            }
        }
        return query;
    }

    async updatePrivacyPartial(userId: string, dto: UpdatePrivacyDto) {
        const update = this.buildSetQuery('settings.privacy', dto);
        return this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('settings');
    }

    async updateNotifications(userId: string, dto: UpdateNotificationsDto) {
        const update = this.buildSetQuery('settings.notifications', dto);
        return this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('settings');
    }

    async updateMedia(userId: string, dto: UpdateMediaDto) {
        const update = this.buildSetQuery('settings.media', dto);
        return this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).select('settings');
    }

    async updateTheme(userId: string, dto: UpdateThemeDto) {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $set: { 'settings.theme': dto.theme } },
            { new: true }
        ).select('settings');
    }

    async blockUser(blockerId: string, blockedId: string) {
        if (blockerId === blockedId) throw new BadRequestException('Cannot block yourself');

        // Check if already blocked
        const existing = await this.blockedUserModel.findOne({
            blockerId: new Types.ObjectId(blockerId),
            blockedId: new Types.ObjectId(blockedId)
        });

        if (existing) return existing;

        const session = await this.userModel.db.startSession();
        session.startTransaction();
        try {
            await new this.blockedUserModel({
                blockerId: new Types.ObjectId(blockerId),
                blockedId: new Types.ObjectId(blockedId)
            }).save({ session });

            await this.userModel.findByIdAndUpdate(blockerId, {
                $addToSet: { blockedUsers: new Types.ObjectId(blockedId) }
            }, { session });

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async unblockUser(blockerId: string, blockedId: string) {
        const session = await this.userModel.db.startSession();
        session.startTransaction();
        try {
            await this.blockedUserModel.findOneAndDelete({
                blockerId: new Types.ObjectId(blockerId),
                blockedId: new Types.ObjectId(blockedId)
            }, { session });

            await this.userModel.findByIdAndUpdate(blockerId, {
                $pull: { blockedUsers: new Types.ObjectId(blockedId) }
            }, { session });

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getBlockedUsers(userId: string) {
        return this.blockedUserModel.find({ blockerId: new Types.ObjectId(userId) })
            .populate('blockedId', 'fullName avatarUrl')
            .exec();
    }

    async deleteAccount(userId: string) {
        return await this.userModel.findByIdAndUpdate(userId, { deletedAt: new Date() });
    }

    async downloadUserData(userId: string) {
        // Gather data from all modules (UserService, FeedService, ChatService...)
        // For MVP, just return user profile
        return this.userModel.findById(userId).populate('contacts').exec();
    }
}
