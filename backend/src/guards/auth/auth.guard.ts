import { InjectRedis } from '@nestjs-modules/ioredis';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly authService: AuthService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // const token = request.headers.authorization?.split([' '])[1];
    const token = request.headers.authorization?.split([' ']).slice(-1).join('');
    const decode = this.authService.verifyToken(token);
    // console.log(decode);    

    if(!decode){
      throw new UnauthorizedException("Unauthrized");
    }
    const jti = decode.jti;
    // check black list
    const blackList = await this.redis.get(`blacklist_${decode.jti}`);
    if(blackList){
      throw new UnauthorizedException("Unauthrized");
    }
    const user = await this.authService.profile(decode.userId);
    request.user = user;
    request.user.jti = jti;
    request.user.exp = decode.exp;
    const device = await this.redis.get(`Device_${request.user.id}`);
    
    if(device !== request.user.jti){
      return false;
    }
    (await this.redis.keys(`jwt_refresh_*`)).forEach(async (jti) => {
     const refreshOnRedis = await this.redis.get(jti);
      if (refreshOnRedis) {
        const decode = JSON.parse(refreshOnRedis);
       if (decode) {
        const userId = decode.userId;
        if (userId === request.user.id && decode.jtiAccessToken !== request.user.jti) {
          await this.redis.del(jti)
        }
       }
      }
    })
    return true;
  }
}
// iat thời gian tạo token
// exp thời gian hết hạn token