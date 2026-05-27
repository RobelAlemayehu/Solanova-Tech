import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

      const isOwner = requestingUser && (ownerIdString === requestingUser.id || ownerIdString === (requestingUser as any)._id);
      const isAdmin = requestingUser && requestingUser.role === 'admin';

      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('You do not have permission to view this draft property');
      }
    }

    return property;
  }

  /**
   * Publishes a property.
   * NOTE: MongoDB transactions require a replica set. To simulate atomicity in environments
   * without a replica set (e.g., standalone development databases), we use findOneAndUpdate
   * with a status constraint ({ status: 'draft' }) which acts as an optimistic lock instead
   * of using a formal multi-document session transaction. This provides safety against
   * race conditions where multiple requests attempt to publish the same draft property simultaneously,
   * though it lacks multi-document rollback capability.
   */
  async publish(id: string, ownerId: string): Promise<PropertyDocument> {
    const property = await this.propertyModel.findOne({ _id: id, deletedAt: null });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const propertyOwnerId = property.ownerId?.toString();
    if (propertyOwnerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to publish this property');
    }

    if (property.status !== 'draft') {
      throw new BadRequestException('Only draft properties can be published');
    }

    const missingFields: string[] = [];
    if (!property.title) missingFields.push('title');
    if (!property.description) missingFields.push('description');
    if (!property.location) missingFields.push('location');
    if (property.price === undefined || property.price === null) missingFields.push('price');
    if (!property.images || property.images.length === 0) missingFields.push('images');

    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required fields to publish: ${missingFields.join(', ')}`);
    }

    const updated = await this.propertyModel.findOneAndUpdate(
      { _id: id, status: 'draft' },
      { $set: { status: 'published' } },
      { new: true },
    );

    if (!updated) {
      throw new ConflictException('Property was already published by another request');
    }

    return updated;
  }

  async remove(id: string, requestingUser: { id: string; role: string }) {
    const property = await this.propertyModel.findOne({ _id: id, deletedAt: null });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (requestingUser.role === 'owner') {
      if (property.ownerId?.toString() !== requestingUser.id) {
        throw new ForbiddenException('You do not have permission to delete this property');
      }
    }

    await this.propertyModel.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });

    return { message: 'Property deleted' };
  }
}
