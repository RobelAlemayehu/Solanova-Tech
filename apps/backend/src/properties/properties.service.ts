import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePropertyDto } from './dto/create-property.dto';
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
}
