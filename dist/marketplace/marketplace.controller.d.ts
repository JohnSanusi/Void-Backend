import { MarketplaceService } from './marketplace.service';
export declare class MarketplaceController {
    private readonly marketplaceService;
    constructor(marketplaceService: MarketplaceService);
    createListing(req: any, data: any): Promise<import("./schemas/listing.schema").ListingDocument>;
    searchListings(term: string, lat: number, lng: number, distance: number, limit: number, offset: number): Promise<import("./schemas/listing.schema").ListingDocument[]>;
    getListing(id: string): Promise<import("./schemas/listing.schema").ListingDocument>;
    updateStatus(req: any, id: string, status: 'active' | 'sold'): Promise<import("./schemas/listing.schema").ListingDocument>;
}
