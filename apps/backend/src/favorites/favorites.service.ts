import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from '../properties/schemas/property.schema';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<FavoriteDocument>,
    @InjectModel(Property.name) private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  async toggleFavorite(userId: string, propertyId: string) {
    const property = await this.propertyModel.findOne({
      _id: propertyId,
      status: 'published',
      deletedAt: null,
    });

    if (!property) {
      throw new NotFoundException('Property not found or is not publicly available');
    }

    const existing = await this.favoriteModel.findOne({ userId, propertyId });

    if (existing) {
      await this.favoriteModel.deleteOne({ _id: existing._id });
      return { favorited: false };
    }

    await this.favoriteModel.create({ userId, propertyId });
    return { favorited: true };
  }

  async getUserFavorites(userId: string, page: number, limit: number) {
    const raw = await this.favoriteModel
      .find({ userId })
      .populate({
        path: 'propertyId',
        match: { status: 'published', deletedAt: null },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // populate match filters out non-matching documents by setting propertyId to null
    const data = raw.filter((fav) => fav.propertyId !== null);

    const total = await this.favoriteModel.countDocuments({ userId });

    return { data, total, page, limit };
  }
}
