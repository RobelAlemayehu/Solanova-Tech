import { Controller, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // JWT is required globally — no @Public() here, so only authenticated users can toggle
  @Post(':propertyId/toggle')
  async toggle(
    @Param('propertyId') propertyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.favoritesService.toggleFavorite(userId, propertyId);
  }
}
