import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

export const ROLES_KEY = 'roles';

/** Restrict a route to one or more UserRoles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
