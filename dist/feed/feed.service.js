"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("./schemas/post.schema");
let FeedService = class FeedService {
    postModel;
    constructor(postModel) {
        this.postModel = postModel;
    }
    async createPost(userId, data) {
        const post = new this.postModel({
            authorId: new mongoose_2.Types.ObjectId(userId),
            ...data,
        });
        return post.save();
    }
    async getFeed(limit = 20, lastId, lastCreatedAt) {
        const query = { visibility: 'public' };
        if (lastId && lastCreatedAt) {
            query.$or = [
                { createdAt: { $lt: lastCreatedAt } },
                { createdAt: lastCreatedAt, _id: { $lt: new mongoose_2.Types.ObjectId(lastId) } },
            ];
        }
        return this.postModel
            .find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .populate('authorId', 'fullName avatarUrl')
            .exec();
    }
    async getReels(limit = 10, lastId, lastCreatedAt) {
        const query = { type: 'reel', visibility: 'public' };
        if (lastId && lastCreatedAt) {
            query.$or = [
                { createdAt: { $lt: lastCreatedAt } },
                { createdAt: lastCreatedAt, _id: { $lt: new mongoose_2.Types.ObjectId(lastId) } },
            ];
        }
        return this.postModel
            .find(query)
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .populate('authorId', 'fullName avatarUrl')
            .exec();
    }
    async toggleLike(postId, userId) {
        const post = await this.postModel.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } }, { new: true });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return { likesCount: post.likesCount };
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], FeedService);
//# sourceMappingURL=feed.service.js.map