import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Property', required: true })
  propertyId!: MongooseSchema.Types.ObjectId;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

// Compound unique index to prevent duplicate favorites of the same property by the same user
FavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
