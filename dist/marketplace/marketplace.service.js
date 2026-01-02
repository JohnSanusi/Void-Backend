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
exports.MarketplaceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const listing_schema_1 = require("./schemas/listing.schema");
let MarketplaceService = class MarketplaceService {
    listingModel;
    constructor(listingModel) {
        this.listingModel = listingModel;
    }
    async createListing(sellerId, data) {
        const listing = new this.listingModel({
            sellerId: new mongoose_2.Types.ObjectId(sellerId),
            ...data,
            location: {
                type: 'Point',
                coordinates: data.coordinates,
            },
        });
        return listing.save();
    }
    async searchListings(query) {
        const filter = { status: 'active' };
        if (query.term) {
            filter.$text = { $search: query.term };
        }
        if (query.lat !== undefined && query.lng !== undefined) {
            filter.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [query.lng, query.lat] },
                    $maxDistance: query.maxDistance || 10000,
                },
            };
        }
        return this.listingModel
            .find(filter)
            .limit(query.limit || 20)
            .skip(query.offset || 0)
            .sort({ createdAt: -1 })
            .populate('sellerId', 'fullName avatarUrl')
            .exec();
    }
    async updateStatus(listingId, sellerId, status) {
        const listing = await this.listingModel.findOneAndUpdate({ _id: listingId, sellerId: new mongoose_2.Types.ObjectId(sellerId) }, { status }, { new: true });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found or unauthorized');
        return listing;
    }
    async getListingDetails(listingId) {
        const listing = await this.listingModel
            .findById(listingId)
            .populate('sellerId', 'fullName avatarUrl')
            .exec();
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        return listing;
    }
};
exports.MarketplaceService = MarketplaceService;
exports.MarketplaceService = MarketplaceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(listing_schema_1.Listing.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MarketplaceService);
//# sourceMappingURL=marketplace.service.js.map