import { FeedService } from './feed.service';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    createPost(req: any, data: any): Promise<import("./schemas/post.schema").PostDocument>;
    getFeed(limit: number, lastId: string, lastCreatedAt: string): Promise<import("./schemas/post.schema").PostDocument[]>;
    getReels(limit: number, lastId: string, lastCreatedAt: string): Promise<import("./schemas/post.schema").PostDocument[]>;
    toggleLike(req: any, id: string): Promise<{
        likesCount: number;
    }>;
}
