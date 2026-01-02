import { Model } from 'mongoose';
import { PostDocument } from './schemas/post.schema';
export declare class FeedService {
    private postModel;
    constructor(postModel: Model<PostDocument>);
    createPost(userId: string, data: any): Promise<PostDocument>;
    getFeed(limit?: number, lastId?: string, lastCreatedAt?: Date): Promise<PostDocument[]>;
    getReels(limit?: number, lastId?: string, lastCreatedAt?: Date): Promise<PostDocument[]>;
    toggleLike(postId: string, userId: string): Promise<{
        likesCount: number;
    }>;
}
