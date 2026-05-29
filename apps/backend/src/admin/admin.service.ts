import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property, PropertyDocument } from '../properties/schemas/property.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getMetrics() {
    const baseFilter = { deletedAt: null };

    const [totalProperties, totalPublished, totalDraft, totalArchived, totalUsers, totalOwners] =
      await Promise.all([
        this.propertyModel.countDocuments(baseFilter),
        this.propertyModel.countDocuments({ ...baseFilter, status: 'published' }),
        this.propertyModel.countDocuments({ ...baseFilter, status: 'draft' }),
        this.propertyModel.countDocuments({ ...baseFilter, status: 'archived' }),
        this.userModel.countDocuments({ deletedAt: null, role: 'user' }),
        this.userModel.countDocuments({ deletedAt: null, role: 'owner' }),
      ]);

    return {
      totalProperties,
      totalPublished,
      totalDraft,
      totalArchived,
      totalUsers,
      totalOwners,
    };
  }
}
