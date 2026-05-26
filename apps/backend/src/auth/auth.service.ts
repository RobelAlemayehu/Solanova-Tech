import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, role } = dto;

    // 1. Check if the email already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // 2. Do not allow 'admin' self-assignment
    if (role === UserRole.ADMIN) {
      throw new BadRequestException('Self-assignment of admin role is prohibited');
    }

    // 3. Hash password with bcrypt (10 rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Create and save new user
    const newUser = await this.userModel.create({
      ...dto,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 5. Return user object with password field omitted
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...safeUser } = newUser.toObject();
    return safeUser;
  }
}
