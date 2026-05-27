import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // JWT required globally — authenticated users only
  @Get()
  async getMyFavorites(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.favoritesService.getUserFavorites(userId, page, limit);
  }

  @Post(':propertyId/toggle')
  async toggle(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.toggleFavorite(userId, propertyId);
  }
}

