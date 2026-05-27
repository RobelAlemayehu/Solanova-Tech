import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/schemas/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the required roles from the handler or controller metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles() decorator is present, allow all authenticated users through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // user is populated by JwtStrategy.validate() via the global JwtAuthGuard
    const { user } = context.switchToHttp().getRequest<{ user: { role: UserRole } }>();

    return requiredRoles.includes(user.role);
  }
}
