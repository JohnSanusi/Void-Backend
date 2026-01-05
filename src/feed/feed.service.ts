import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema'; // Assuming Post and PostDocument are defined here
import { UsersService } from '../users/users.service';

@Injectable()
export class FeedService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        private usersService: UsersService,
    ) { }

    async createPost(userId: string, data: { content: string; mediaUrls?: string[]; type: 'post' | 'reel'; visibility?: 'public' | 'followers' }): Promise<PostDocument> {
        const post = new this.postModel({
            authorId: new Types.ObjectId(userId),
            ...data,
        });
        return post.save();
    }

    async getFeed(userId: string, limit = 20, lastId?: string, lastCreatedAt?: Date): Promise<PostDocument[]> {
        const blockedIds = await this.usersService.getBlockedUserIds(userId);

        const query: FilterQuery<PostDocument> = {
            visibility: 'public',
            authorId: { $nin: blockedIds.map(id => new Types.ObjectId(id)) }
        };

        if (lastId && lastCreatedAt) {
            (query as any).$or = [
                { createdAt: { $lt: lastCreatedAt } },
                { createdAt: lastCreatedAt, _id: { $lt: new Types.ObjectId(lastId) } },
            ];
        }

        return this.postModel
            .find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .populate('authorId', 'fullName avatarUrl')
            .exec();
    }

    async getReels(userId: string, limit = 10, lastId?: string, lastCreatedAt?: Date): Promise<PostDocument[]> {
        const blockedIds = await this.usersService.getBlockedUserIds(userId);

        const query: FilterQuery<PostDocument> = {
            type: 'reel',
            visibility: 'public',
            authorId: { $nin: blockedIds.map(id => new Types.ObjectId(id)) }
        };

        if (lastId && lastCreatedAt) {
            (query as any).$or = [
                { createdAt: { $lt: lastCreatedAt } },
                { createdAt: lastCreatedAt, _id: { $lt: new Types.ObjectId(lastId) } },
            ];
        }

        return this.postModel
            .find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .populate('authorId', 'fullName avatarUrl')
            .exec();
    }

    async toggleLike(postId: string): Promise<{ likesCount: number }> {
        // In a real app, you'd have a separate Likes collection to track who liked what.
        // For MVP efficiency, we just increment/decrement. 
        // Optimization: This should be handled atomically.
        const post = await this.postModel.findByIdAndUpdate(
            postId,
            { $inc: { likesCount: 1 } }, // Mocking simple increment for now
            { new: true },
        );

        if (!post) throw new NotFoundException('Post not found');
        return { likesCount: post.likesCount };
    }
}
