import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { User } from 'src/entities/user.entity';
import Hash from 'src/utils/hashing';
import { Not, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

type GoogleParams = {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  access_type: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  googleRedirect() {
    const params: GoogleParams = {
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL as string,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
    };

    const oAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params).toString()}`;
    return oAuthUrl;
  }

  async googleCallback(code: string) {
    const url = `https://oauth2.googleapis.com/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_SECRET_ID,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });    
    if (!response.ok) {
      return;
    }
    return response.json();
  }

  async googleLogin(accessToken: string){
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,);
    const profileFromGoogle: unknown = await response.json();
    console.log(profileFromGoogle);
    const {email,name,picture} = profileFromGoogle as {
        email:string;
        name:string;
        picture:string
    };
    let user = await this.userRepository.findOne({where:{email}});
    if(!user){
        user = await this.userRepository.save({
            name,
            email,
            avatar:picture
        })
    }
    return this.createToken(user);
  }

  async profile(id:number){
    const user = await this.userRepository.findOne({where:{id}});
    if(!user){
        return false;
    }
    return user;
  }

  verifyToken = (token: string) => {
    try {
      const decode = this.jwtService.verify(token);
      return decode;
    } catch (error) {
      return null;
    }
  };

  verifyRefreshToken = (token: string) => {
    try {
      const decode = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
      return decode;
    } catch (error) {
      return null;
    }
  };

  async refreshToken(body:any){
    const refreshToken = body.refreshToken;
    try{
        const decode = this.jwtService.verify(refreshToken, {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        });
        const token = this.jwtService.sign({
            userId: decode.userId,
            email: decode.email,
        });
        const jtiRefreshToken  = decode.jti;
        const accessToken = await this.redis.get(`jwt_refresh_${jtiRefreshToken}`);
        if(accessToken){
            const now = Date.now() / 1000;
            const {exp, jtiAccessToken} = JSON.parse(accessToken);
            if(now <exp){
                await this.redis.set(`jti_blacklist_${jtiAccessToken}`, jtiAccessToken, 'EX', Math.round(exp - now));
            }
        }else{
            return false;
        }
        return {
                accessToken: token,
                refreshToken
            };
    }catch(error){
        return false;
    }
  }

  async logout(jti:string,exp:number){
    const diff = exp - Date.now() / 1000;
    await this.redis.set(`jti_blacklist_${jti}`, jti, 'EX', Math.round(diff));
    return {sucess:true};

  }

  async createToken(user: any){
    const jtiAccessToken = uuid();
    const token = this.jwtService.sign({
        jti:jtiAccessToken,
        userId:user.id,
        email:user.email
    })
    const jtiRefreshToken = uuid();
    const refreshToken = this.jwtService.sign({
        jti: jtiRefreshToken,
        userId:user.id,
        email:user.email
    },{
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    });
    //Thêm jti vào redis
    //jtiRefreshToken: jtiAccessToken
    //- decoded Access Token để lấy ra exp
    const { exp: expAccessToken } = this.verifyToken(token);
    //- decoded Refresh Token để lấy ra exp
    const { exp: expRefreshToken } = this.verifyRefreshToken(refreshToken);

    await this.redis.set(
      `jwt_refresh_${jtiRefreshToken}`,
      JSON.stringify({
        jtiAccessToken,
        exp: expAccessToken,
      }),
      'EX',
      Math.round(expRefreshToken - Date.now() / 1000),
    );
    return {
      accessToken: token,
      refreshToken,
      user,
    };
  }

  register(body: any) {
    body.password = Hash.make(body.password);
    return this.userRepository.save(body);
  }

  async login(body:any){
    const user = await this.userRepository.findOne({where:{email:body.email}});
    if(!user){
        return false;
    }
    if(!Hash.compare(body.password,user.password)){
        return false;
    }
    const jtiAccessToken = uuid();
    const token = this.jwtService.sign({
      jti:jtiAccessToken,
      userId:user.id,
      email:user.email
    });
    const jtiRefreshToken = uuid();
    const refreshToken = this.jwtService.sign({
      jti:jtiRefreshToken,
      userId:user.id,
      email:user.email
    },{
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED,
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    })

    const {exp:expAccessToken} = this.verifyToken(token);
    const {exp:expRefreshToken} = this.verifyRefreshToken(refreshToken);
    await this.redis.set(
      `jwt_refresh_${jtiRefreshToken}`,
      JSON.stringify({
        jtiAccessToken,
        exp:expAccessToken,
        userId:user.id,
      }),
      'EX',
      Math.round(expRefreshToken - Date.now() / 1000),
    );
    await this.redis.set(
      `Device_${user.id}`,
      jtiAccessToken,
      'EX',
      Math.round(expAccessToken - Date.now() / 1000),
    )
    await this.redis.keys(`jwt_refresh_*`)

    delete (user as any).password;

    return {
      accessToken:token,
      refreshToken,
      user
    }
  }

  async updateUser(user:any, data: any) {
    const id = user.id;
    const email = data.email;
    const emailExits = await this.userRepository.findOne({
      where:{
        email,
        id: Not(id),
      }
    });
    if(emailExits) return false
    const userUpdata = {
      ...user,
      ...data,
    };
    if (data.password) {
      userUpdata.password = Hash.make(data.password);
    }
    await this.userRepository.save(userUpdata);
    return userUpdata;
  }

  async updateProfile(id: number, data: any) {
    if (data.password) {
      data.password = await Hash.make(data.password);
    }

    await this.userRepository.update(id, data);

    return await this.userRepository.findOne({ where: { id } });
  }

}
