import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Listing, ListingDocument } from './schemas/listing.schema';

@Injectable()
export class MarketplaceService {
    constructor(@InjectModel(Listing.name) private listingModel: Model<ListingDocument>) { }

    async createListing(sellerId: string, data: { coordinates: number[];[key: string]: any }): Promise<ListingDocument> {
        const listing = new this.listingModel({
            sellerId: new Types.ObjectId(sellerId),
            ...data,
            location: {
                type: 'Point',
                coordinates: data.coordinates, // Expecting [lng, lat]
            },
        });
        return listing.save();
    }

    async searchListings(query: {
        term?: string;
        lat?: number;
        lng?: number;
        maxDistance?: number;
        limit?: number;
        offset?: number;
    }): Promise<ListingDocument[]> {
        const filter: { status: string; $text?: any; location?: any } = { status: 'active' };

        if (query.term) {
            filter.$text = { $search: query.term };
        }

        if (query.lat !== undefined && query.lng !== undefined) {
            filter.location = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [query.lng, query.lat] },
                    $maxDistance: query.maxDistance || 10000, // Default 10km
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

    async updateStatus(listingId: string, sellerId: string, status: 'active' | 'sold'): Promise<ListingDocument> {
        const listing = await this.listingModel.findOneAndUpdate(
            { _id: listingId, sellerId: new Types.ObjectId(sellerId) },
            { status },
            { new: true },
        );

        if (!listing) throw new NotFoundException('Listing not found or unauthorized');
        return listing;
    }

    async getListingDetails(listingId: string): Promise<ListingDocument> {
        const listing = await this.listingModel
            .findById(listingId)
            .populate('sellerId', 'fullName avatarUrl')
            .exec();

        if (!listing) throw new NotFoundException('Listing not found');
        return listing;
    }
}
