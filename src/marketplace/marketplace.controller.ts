import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('marketplace')
@UseGuards(AuthGuard('jwt'))
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Post('listings')
  async createListing(
    @Req() req: RequestWithUser,
    @Body() data: { coordinates: number[] } & Record<string, unknown>,
  ) {
    return this.marketplaceService.createListing(req.user.userId, data);
  }

  @Get('listings')
  async searchListings(
    @Query('term') term: string,
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('distance') distance: number,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.marketplaceService.searchListings({
      term,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      maxDistance: distance ? Number(distance) : undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get('listings/:id')
  async getListing(@Param('id') id: string) {
    return this.marketplaceService.getListingDetails(id);
  }

  @Patch('listings/:id/status')
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body('status') status: 'active' | 'sold',
  ) {
    return this.marketplaceService.updateStatus(id, req.user.userId, status);
  }
}
