import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class FeedService {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) { }

    async createPost(userId: string, data: any): Promise<PostDocument> {
        const post = new this.postModel({
            authorId: new Types.ObjectId(userId),
            ...data,
        });
        return post.save();
    }

    async getFeed(limit = 20, lastId?: string, lastCreatedAt?: Date): Promise<PostDocument[]> {
        const query: any = { visibility: 'public' };

        if (lastId && lastCreatedAt) {
            query.$or = [
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

    async getReels(limit = 10, lastId?: string, lastCreatedAt?: Date): Promise<PostDocument[]> {
        const query: any = { type: 'reel', visibility: 'public' };

        if (lastId && lastCreatedAt) {
            query.$or = [
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

    async toggleLike(postId: string, userId: string): Promise<{ likesCount: number }> {
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
