import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // On @Public() routes, parse JWT when present but allow anonymous access.
    if (this.isPublicRoute(context)) {
      try {
        return (await super.canActivate(context)) as boolean;
      } catch {
        return true;
      }
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (this.isPublicRoute(context)) {
      return user;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    return user;
  }
}
