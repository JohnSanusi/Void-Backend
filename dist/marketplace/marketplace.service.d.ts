import { Model } from 'mongoose';
import { ListingDocument } from './schemas/listing.schema';
export declare class MarketplaceService {
    private listingModel;
    constructor(listingModel: Model<ListingDocument>);
    createListing(sellerId: string, data: any): Promise<ListingDocument>;
    searchListings(query: {
        term?: string;
        lat?: number;
        lng?: number;
        maxDistance?: number;
        limit?: number;
        offset?: number;
    }): Promise<ListingDocument[]>;
    updateStatus(listingId: string, sellerId: string, status: 'active' | 'sold'): Promise<ListingDocument>;
    getListingDetails(listingId: string): Promise<ListingDocument>;
}
