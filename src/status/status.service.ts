import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Status, StatusDocument } from './schemas/status.schema';

@Injectable()
export class StatusService {
    constructor(@InjectModel(Status.name) private statusModel: Model<StatusDocument>) { }

    async createStatus(userId: string, data: { mediaUrl: string; type: string }): Promise<StatusDocument> {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const status = new this.statusModel({
            userId: new Types.ObjectId(userId),
            mediaUrl: data.mediaUrl,
            type: data.type,
            expiresAt,
        });

        return status.save();
    }

    async getActiveStatuses(followedUserIds: string[]): Promise<StatusDocument[]> {
        const userObjectIds = followedUserIds.map(id => new Types.ObjectId(id));
        return this.statusModel
            .find({
                userId: { $in: userObjectIds },
                expiresAt: { $gt: new Date() },
            })
            .populate('userId', 'fullName avatarUrl')
            .sort({ createdAt: -1 })
            .exec();
    }

    async viewStatus(statusId: string, userId: string): Promise<void> {
        const status = await this.statusModel.findById(statusId);
        if (!status) throw new NotFoundException('Status not found');

        const alreadyViewed = status.viewers.list.some(v => v.userId.toString() === userId);
        if (!alreadyViewed) {
            // Capping viewer list to 100 for record keeping; count remains accurate
            const updateQuery: any = {
                $inc: { 'viewers.count': 1 },
            };

            if (status.viewers.list.length < 100) {
                updateQuery.$push = {
                    'viewers.list': { userId: new Types.ObjectId(userId), seenAt: new Date() },
                };
            }

            await this.statusModel.findByIdAndUpdate(statusId, updateQuery);
        }
    }

    async getMyStatuses(userId: string): Promise<StatusDocument[]> {
        return this.statusModel
            .find({ userId: new Types.ObjectId(userId), expiresAt: { $gt: new Date() } })
            .sort({ createdAt: -1 })
            .exec();
    }
}
