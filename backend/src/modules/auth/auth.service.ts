import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { name, Template } from 'ejs';
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
    private readonly mailService: MailerService,
    @InjectQueue('mailRegister') private mailQueue: Queue,
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

  async googleLogin(accessToken: string) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
    );
    const profileFromGoogle: unknown = await response.json();
    console.log(profileFromGoogle);
    const { email, name, picture } = profileFromGoogle as {
      email: string;
      name: string;
      picture: string;
    };
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = await this.userRepository.save({
        name,
        email,
        avatar: picture,
      });
      await this.mailQueue.add(
        'send-mail',
        {
          to: email,
          subject: 'Mail xác nhận đăng kí',
          content: {
            template: 'welcome',
            context: {
              name: name,
            },
          },
        },
        {
          delay: 3000,
          attempts: 3,
          backoff: 5000,
          removeOnFail: true,
        },
      );
    }

    return this.createToken(user);
  }

  async profile(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) {
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

  async refreshToken(body: any) {
    const refreshToken = body.refreshToken;
    try {
      const decode = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      });
      const token = this.jwtService.sign({
        userId: decode.userId,
        email: decode.email,
        role: decode.role,
        jti: uuid(),
      });
      const jtiRefreshToken = decode.jti;
      const accessToken = await this.redis.get(
        `jwt_refresh_${jtiRefreshToken}`,
      );
      if (accessToken) {
        const now = Date.now() / 1000;
        const { exp, jtiAccessToken } = JSON.parse(accessToken);
        if (now < exp) {
          await this.redis.set(
            `jti_blacklist_${jtiAccessToken}`,
            jtiAccessToken,
            'EX',
            Math.round(exp - now),
          );
        }
      } else {
        return false;
      }
      return {
        accessToken: token,
        refreshToken,
      };
    } catch (error) {
      return false;
    }
  }

  async logout(jti: string, exp: number) {
    const diff = exp - Date.now() / 1000;
    await this.redis.set(`jti_blacklist_${jti}`, jti, 'EX', Math.round(diff));
    return { sucess: true };
  }

  async createToken(user: any) {
    const jtiAccessToken = uuid();
    const token = this.jwtService.sign({
      jti: jtiAccessToken,
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const jtiRefreshToken = uuid();
    const refreshToken = this.jwtService.sign(
      {
        jti: jtiRefreshToken,
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      },
    );
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

  async register(body: any) {
    const { email, password, name, avatar } = body;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) throw new BadRequestException('Email đã được sử dụng');
    body.password = Hash.make(body.password);
    const newUser = this.userRepository.create(body);
    await this.mailQueue.add(
      'send-mail',
      {
        to: email,
        subject: 'Mail xác nhận đăng kí',
        content: {
          template: 'welcome',
          context: {
            name: name,
          },
        },
      },
      {
        delay: 3000,
        attempts: 3,
        backoff: 5000,
        removeOnFail: true,
      },
    );
    return await this.userRepository.save(newUser);
  }

  async testMail() {
    const job = await this.mailQueue.add(
      'send-mail',
      {
        to: 'tranhoangson03@gmail.com',
        subject: 'Email từ queue',
        content: 'welcome',
      },
      {
        delay: 3000,
        attempts: 3,
        backoff: 5000,
        removeOnFail: true,
      },
    );
    return job;
  }

  async login(body: any) {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });
    if (!user) {
      return false;
    }
    if (!Hash.compare(body.password, user.password)) {
      return false;
    }
    const jtiAccessToken = uuid();
    const token = this.jwtService.sign({
      jti: jtiAccessToken,
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const jtiRefreshToken = uuid();
    const refreshToken = this.jwtService.sign(
      {
        jti: jtiRefreshToken,
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      },
    );

    const { exp: expAccessToken } = this.verifyToken(token);
    const { exp: expRefreshToken } = this.verifyRefreshToken(refreshToken);
    await this.redis.set(
      `jwt_refresh_${jtiRefreshToken}`,
      JSON.stringify({
        jtiAccessToken,
        exp: expAccessToken,
        userId: user.id,
      }),
      'EX',
      Math.round(expRefreshToken - Date.now() / 1000),
    );
    await this.redis.set(
      `Device_${user.id}`,
      jtiAccessToken,
      'EX',
      Math.round(expAccessToken - Date.now() / 1000),
    );
    await this.redis.keys(`jwt_refresh_*`);

    delete (user as any).password;

    return {
      accessToken: token,
      refreshToken,
      user,
    };
  }

  async updateUser(user: any, data: any) {
    const id = user.id;
    const email = data.email;
    const emailExits = await this.userRepository.findOne({
      where: {
        email,
        id: Not(id),
      },
    });
    if (emailExits) return false;
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

  async forgotPassword(body: any) {
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!user) return false;

    // Tạo mã xác nhận (6 chữ số)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào Redis với key là email, thời gian hết hạn 5 phút
    await this.redis.set(`forgot-password:${body.email}`, otp, 'EX', 5 * 60);

    // Gửi email chứa OTP
    await this.mailQueue.add(
      'send-mail-password',
      {
        to: body.email,
        subject: 'MÃ XÁC NHẬN ĐẶT LẠI MẬT KHẨU',
        content: {
          template: 'forgotpassword',
          context: {
            name: user.name,
            otp,
          },
        },
      },
      {
        delay: 0,
        attempts: 3,
        backoff: 5000,
        removeOnFail: true,
      },
    );

    return {
      success: true,
      message:
        'Mã xác nhận đã được gửi tới email của bạn. Hãy kiểm tra hộp thư.',
    };
  }

  async resetPassword(body: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    const { email, otp, newPassword } = body;

    // 1. Kiểm tra user tồn tại
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return {
        success: false,
        message: 'Người dùng không tồn tại.',
      };
    }

    // 2. Lấy OTP trong Redis
    const savedOtp = await this.redis.get(`forgot-password:${email}`);
    if (!savedOtp) {
      return {
        success: false,
        message: 'OTP hết hạn hoặc không tồn tại.',
      };
    }

    // 3. So sánh OTP
    if (savedOtp !== otp) {
      return {
        success: false,
        message: 'OTP không đúng.',
      };
    }

    // 4. Mã hóa mật khẩu mới
    const hashedPassword = await Hash.make(newPassword);

    // 5. Lưu mật khẩu mới
    user.password = hashedPassword;
    await this.userRepository.save(user);

    // 6. Xóa OTP để tránh dùng lại
    await this.redis.del(`forgot-password:${email}`);

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công.',
    };
  }

  async loguot(jti: string, exp: number) {
    const diff = exp - Date.now() / 1000;
    await this.redis.set(`blacklist_${jti}`, jti, 'EX', Math.round(diff));
    return { sucess: true };
  }
}
