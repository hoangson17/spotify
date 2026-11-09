import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRedis() protected readonly redis: Redis,
    protected readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    const match =
      typeof header === 'string' ? /^Bearer ([^ ]+)$/.exec(header) : null;
    if (!match)
      throw new UnauthorizedException('Missing or invalid bearer token');
    const decode = this.authService.verifyToken(match[1]);
    if (!decode?.userId || !decode.sid || !decode.jti)
      throw new UnauthorizedException('Invalid token');
    const active = await this.redis.get(`Device_${decode.userId}`);
    if (active !== decode.sid)
      throw new UnauthorizedException('Session expired');
    const user = await this.authService.profile(decode.userId);
    if (!user || user.deletedAt)
      throw new UnauthorizedException('Account unavailable');
    request.user = {
      ...user,
      jti: decode.jti,
      exp: decode.exp,
      sid: decode.sid,
    };
    return true;
  }
}

@Injectable()
export class OptionalAuthGuard extends AuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!context.switchToHttp().getRequest().headers.authorization) return true;
    return super.canActivate(context);
  }
}
