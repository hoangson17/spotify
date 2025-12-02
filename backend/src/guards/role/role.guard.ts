import { InjectRedis } from '@nestjs-modules/ioredis';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';


@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log(request);
    
    // Lấy token
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new ForbiddenException('No token provided');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      throw new ForbiddenException('Invalid token format');
    }

    const decode = this.authService.verifyToken(token);
    if (!decode) {
      throw new ForbiddenException('Invalid token');
    }

    if (decode.role !== 'admin') {
      throw new ForbiddenException('Forbidden: Admin only');
    }

    request.user = decode;

    return true;
  }
}

