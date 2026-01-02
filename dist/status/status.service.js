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
exports.StatusService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const status_schema_1 = require("./schemas/status.schema");
let StatusService = class StatusService {
    statusModel;
    constructor(statusModel) {
        this.statusModel = statusModel;
    }
    async createStatus(userId, data) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const status = new this.statusModel({
            userId: new mongoose_2.Types.ObjectId(userId),
            mediaUrl: data.mediaUrl,
            type: data.type,
            expiresAt,
        });
        return status.save();
    }
    async getActiveStatuses(followedUserIds) {
        const userObjectIds = followedUserIds.map(id => new mongoose_2.Types.ObjectId(id));
        return this.statusModel
            .find({
            userId: { $in: userObjectIds },
            expiresAt: { $gt: new Date() },
        })
            .populate('userId', 'fullName avatarUrl')
            .sort({ createdAt: -1 })
            .exec();
    }
    async viewStatus(statusId, userId) {
        const status = await this.statusModel.findById(statusId);
        if (!status)
            throw new common_1.NotFoundException('Status not found');
        const alreadyViewed = status.viewers.list.some(v => v.userId.toString() === userId);
        if (!alreadyViewed) {
            const updateQuery = {
                $inc: { 'viewers.count': 1 },
            };
            if (status.viewers.list.length < 100) {
                updateQuery.$push = {
                    'viewers.list': { userId: new mongoose_2.Types.ObjectId(userId), seenAt: new Date() },
                };
            }
            await this.statusModel.findByIdAndUpdate(statusId, updateQuery);
        }
    }
    async getMyStatuses(userId) {
        return this.statusModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId), expiresAt: { $gt: new Date() } })
            .sort({ createdAt: -1 })
            .exec();
    }
};
exports.StatusService = StatusService;
exports.StatusService = StatusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(status_schema_1.Status.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], StatusService);
//# sourceMappingURL=status.service.js.map