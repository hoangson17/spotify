import { InjectRedis } from '@nestjs-modules/ioredis';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';


@Injectable()
export class RoleGuard implements CanActivate {
     constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly authService: AuthService) {}

   canActivate(context: ExecutionContext): boolean {
     const request = context.switchToHttp().getRequest();    
     const token = request.headers.authorization?.split([' ']).slice(-1).join('');
    console.log(token);
    
    const decode = this.authService.verifyToken(token);

    if (decode.role !== 'admin') throw new ForbiddenException('Forbidden');

    return true;
  }
}
