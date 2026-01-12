import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ListingDocument = Listing & Document;

@Schema()
class Location {
  @Prop({ type: String, default: 'Point', enum: ['Point'] })
  type: string;

  @Prop({ type: [Number], required: true }) // [longitude, latitude]
  coordinates: number[];
}

const LocationSchema = SchemaFactory.createForClass(Location);

@Schema({ timestamps: true })
export class Listing {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: LocationSchema, index: '2dsphere' })
  location: Location;

  @Prop({
    required: true,
    enum: ['active', 'sold'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ListingSchema = SchemaFactory.createForClass(Listing);

// Indexes
ListingSchema.index({ title: 'text', description: 'text' });
ListingSchema.index({ createdAt: -1 });
