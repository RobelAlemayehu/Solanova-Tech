import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  USER = 'user',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, type: String, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, type: String })
  password!: string;

  @Prop({
    type: String,
    enum: [UserRole.ADMIN, UserRole.OWNER, UserRole.USER],
    default: UserRole.USER,
  })
  role!: UserRole;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook: placeholder for password hashing
UserSchema.pre('save', function (next) {
  // Doing nothing yet, placeholder for future password hashing implementation
  next();
});
