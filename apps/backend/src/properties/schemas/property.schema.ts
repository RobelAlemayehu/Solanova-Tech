import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum PropertyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true, type: String, trim: true })
  title!: string;

  @Prop({ required: true, type: String })
  description!: string;

  @Prop({ required: true, type: String })
  location!: string;

  @Prop({ required: true, type: Number, min: 0 })
  price!: number;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({
    type: String,
    enum: [PropertyStatus.DRAFT, PropertyStatus.PUBLISHED, PropertyStatus.ARCHIVED],
    default: PropertyStatus.DRAFT,
  })
  status!: PropertyStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  ownerId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
