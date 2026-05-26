import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
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

  async login(dto: LoginDto) {
    const { email, password } = dto;

    // 1. Find an active, non-deleted user by email
    const user = await this.userModel.findOne({
      email: email.toLowerCase(),
      deletedAt: null,
      isActive: true,
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Sign JWT with user identity payload
    const payload = { sub: user._id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }
}
