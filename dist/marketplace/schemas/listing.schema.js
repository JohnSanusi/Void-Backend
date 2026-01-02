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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingSchema = exports.Listing = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Location = class Location {
    type;
    coordinates;
};
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'Point', enum: ['Point'] }),
    __metadata("design:type", String)
], Location.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Number], required: true }),
    __metadata("design:type", Array)
], Location.prototype, "coordinates", void 0);
Location = __decorate([
    (0, mongoose_1.Schema)()
], Location);
const LocationSchema = mongoose_1.SchemaFactory.createForClass(Location);
let Listing = class Listing {
    sellerId;
    title;
    description;
    price;
    currency;
    images;
    location;
    status;
    createdAt;
};
exports.Listing = Listing;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Listing.prototype, "sellerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Listing.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Listing.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Listing.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD' }),
    __metadata("design:type", String)
], Listing.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Listing.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: LocationSchema, index: '2dsphere' }),
    __metadata("design:type", Location)
], Listing.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['active', 'sold'], default: 'active', index: true }),
    __metadata("design:type", String)
], Listing.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Listing.prototype, "createdAt", void 0);
exports.Listing = Listing = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Listing);
exports.ListingSchema = mongoose_1.SchemaFactory.createForClass(Listing);
exports.ListingSchema.index({ title: 'text', description: 'text' });
exports.ListingSchema.index({ createdAt: -1 });
//# sourceMappingURL=listing.schema.js.map