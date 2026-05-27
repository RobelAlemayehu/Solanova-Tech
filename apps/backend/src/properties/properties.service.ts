import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertiesDto } from './dto/filter-properties.dto';
import { Property, PropertyDocument } from './schemas/property.schema';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  async create(dto: CreatePropertyDto, ownerId: string): Promise<PropertyDocument> {
    return this.propertyModel.create({
      ...dto,
      ownerId,
      status: 'draft',
      images: [],
    });
  }

  async findAll(filters: FilterPropertiesDto, requestingUserRole?: string) {
    const filter: any = { deletedAt: null };

    if (filters.status) {
      filter.status = filters.status;
    } else if (requestingUserRole !== 'admin') {
      filter.status = 'published';
    }

    if (filters.location) {
      filter.location = new RegExp(filters.location, 'i');
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filter.price = {};
      if (filters.minPrice !== undefined) {
        filter.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        filter.price.$lte = filters.maxPrice;
      }
    }

    const skip = (filters.page - 1) * filters.limit;
    const limit = filters.limit;

    const data = await this.propertyModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'email')
      .lean();

    const total = await this.propertyModel.countDocuments(filter);

    return {
      data,
      total,
      page: filters.page,
      limit,
    };
  }

  async findOne(id: string, requestingUser?: { id: string; role: string }) {
    const property = await this.propertyModel
      .findOne({ _id: id, deletedAt: null })
      .populate('ownerId', 'email id')
      .lean();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.status === 'draft') {
      let ownerIdString: string | undefined;
      if (property.ownerId) {
        const owner = property.ownerId as any;
        ownerIdString = owner._id?.toString() || owner.id?.toString() || owner.toString();
      }

      const isOwner = requestingUser && ownerIdString === requestingUser.id;
      const isAdmin = requestingUser && requestingUser.role === 'admin';

      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('You do not have permission to view this draft property');
      }
    }

    return property;
  }
}
