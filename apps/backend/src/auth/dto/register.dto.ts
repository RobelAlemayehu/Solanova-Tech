import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  @IsOptional()
  // NOTE: Self-assignment of 'admin' role is prohibited. If role is omitted, it defaults
  // to 'user'. Any attempt to self-register as 'admin' is blocked/ignored during request handling.
  role?: UserRole;
}
