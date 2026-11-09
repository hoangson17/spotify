import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import Redis from 'ioredis';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { isAdmin } from 'src/utils/roles';
import { Reflector } from '@nestjs/core';
import { PERMISSION_METADATA, requirePermission } from 'src/utils/permissions';

@Injectable()
export class RoleGuard extends AuthGuard {
  constructor(
    @InjectRedis() redis: Redis,
    authService: AuthService,
    private readonly reflector: Reflector = new Reflector(),
  ) {
    super(redis, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    if (!isAdmin(context.switchToHttp().getRequest().user.role)) {
      throw new ForbiddenException('Admin only');
    }
    const actor = context.switchToHttp().getRequest().user;
    if (actor.role !== 'super_admin') {
      const required = this.reflector.getAllAndOverride<string[]>(
        PERMISSION_METADATA,
        [context.getHandler(), context.getClass()],
      );
      if (!required?.length)
        throw new ForbiddenException(
          'No permission configured for this operation',
        );
      for (const permission of required) requirePermission(actor, permission);
    }
    return true;
  }
}
