import { InjectRedis } from '@nestjs-modules/ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { randomInt, randomUUID as uuid } from 'crypto';
import Redis from 'ioredis';
import { User } from 'src/entities/user.entity';
import Hash from 'src/utils/hashing';
import {
  allowedFields,
  assertOwner,
  accountProfileFields,
  emailAddress,
  passwordValue,
  entityId,
  profileFields,
  text,
} from 'src/utils/input';
import { Not, Repository } from 'typeorm';
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

  async googleRedirect(state: string) {
    await this.redis.set(`google-state:${state}`, '1', 'EX', 600);
    const params: GoogleParams = {
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL as string,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
    };

    const oAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ ...params, state }).toString()}`;
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

  async consumeGoogleState(state: string) {
    const consumed = await this.redis.del(`google-state:${state}`);
    if (!consumed) throw new UnauthorizedException('Invalid OAuth state');
  }

  async googleExchangeCode(accessToken: string) {
    const result = await this.googleLogin(accessToken);
    const code = uuid();
    await this.redis.set(
      `google-exchange:${code}`,
      JSON.stringify(result),
      'EX',
      60,
    );
    return code;
  }

  async exchangeGoogleLogin(body: unknown) {
    const data = allowedFields(body, ['code']);
    const code = text(data.code, 'login code', 100);
    const result = await this.redis.eval(
      `local value = redis.call('GET', KEYS[1])
       if value then redis.call('DEL', KEYS[1]) end
       return value`,
      1,
      `google-exchange:${code}`,
    );
    if (typeof result !== 'string')
      throw new UnauthorizedException('Login code expired or already used');
    return JSON.parse(result);
  }

  async googleLogin(accessToken: string) {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!response.ok) throw new UnauthorizedException('Invalid Google token');
    const profileFromGoogle: unknown = await response.json();
    const {
      email: googleEmail,
      name,
      picture,
      verified_email,
    } = profileFromGoogle as {
      email: string;
      name: string;
      picture: string;
      verified_email: boolean;
    };
    const email = emailAddress(googleEmail);
    if (!verified_email)
      throw new UnauthorizedException('Google email is not verified');
    let user = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });
    if (user?.deletedAt) throw new UnauthorizedException('Account is locked');
    if (
      user?.role === 'super_admin' ||
      email === process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
    ) {
      throw new UnauthorizedException(
        'Super admin must sign in with its dedicated credentials',
      );
    }
    if (!user) {
      user = await this.userRepository.save({
        name: String(name || email.split('@')[0]).slice(0, 30),
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

  async profile(id: string) {
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
    allowedFields(body, ['refreshToken']);
    const decode = this.verifyRefreshToken(body.refreshToken);
    if (!decode?.userId || !decode.jti) return false;
    const [session, active] = await Promise.all([
      this.redis.get(`jwt_refresh_${decode.jti}`),
      this.redis.get(`Device_${decode.userId}`),
    ]);
    if (!session || active !== decode.jti) return false;
    const saved = JSON.parse(session);
    if (saved.userId !== decode.userId) return false;
    const user = await this.profile(decode.userId);
    if (!user || user.deletedAt) return false;
    const accessToken = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      jti: uuid(),
      sid: decode.jti,
    });
    return { accessToken, refreshToken: body.refreshToken };
  }

  async logout(user: any) {
    // Compare and delete atomically: an old logout must not revoke a newer login.
    await this.redis.eval(
      `if redis.call('GET', KEYS[1]) == ARGV[1] then
         redis.call('DEL', KEYS[1])
       end
       return redis.call('DEL', KEYS[2])`,
      2,
      `Device_${user.id}`,
      `jwt_refresh_${user.sid}`,
      user.sid,
    );
    return { success: true };
  }

  async revokeSessions(userId: string) {
    await this.redis.eval(
      `local sid = redis.call('GET', KEYS[1])
       if sid then redis.call('DEL', 'jwt_refresh_' .. sid) end
       return redis.call('DEL', KEYS[1])`,
      1,
      `Device_${userId}`,
    );
  }

  async createToken(user: any) {
    const sid = uuid();
    const refreshToken = this.jwtService.sign(
      { jti: sid, userId: user.id },
      {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED as unknown as number,
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      },
    );
    const token = this.jwtService.sign({
      jti: uuid(),
      sid,
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const { exp } = this.verifyRefreshToken(refreshToken);
    const ttl = Math.max(1, Math.ceil(exp - Date.now() / 1000));
    await this.redis.eval(
      `local previous = redis.call('GET', KEYS[1])
       if previous then redis.call('DEL', 'jwt_refresh_' .. previous) end
       redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[3])
       return redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])`,
      2,
      `Device_${user.id}`,
      `jwt_refresh_${sid}`,
      sid,
      JSON.stringify({ userId: user.id }),
      ttl,
    );
    const { password: _password, ...safeUser } = user;
    return { accessToken: token, refreshToken, user: safeUser };
  }

  async register(body: any) {
    const data = profileFields(body);
    const email = emailAddress(data.email);
    if (email === process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()) {
      throw new BadRequestException('Email is reserved');
    }
    const name = text(data.name, 'name', 30);
    const password = passwordValue(data.password);

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) throw new BadRequestException('Email đã được sử dụng');
    const newUser = this.userRepository.create({
      ...data,
      email,
      name,
      password: Hash.make(password),
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
    allowedFields(body, ['email', 'password']);
    const user = await this.userRepository.findOne({
      where: { email: emailAddress(body.email) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        password: true,
        avatar: true,
        created_at: true,
        updated_at: true,
      },
    });
    if (!user) {
      return false;
    }
    if (
      !user.password ||
      !Hash.compare(passwordValue(body.password), user.password)
    ) {
      return false;
    }
    return this.createToken(user);
  }

  async updateUser(user: any, data: any) {
    data = accountProfileFields(user, user, data);
    const id = user.id;
    const email = data.email ?? user.email;
    const emailExits = await this.userRepository.findOne({
      where: {
        email,
        id: Not(id),
      },
    });
    if (emailExits) return false;
    const userUpdata = { id, ...data };
    if (data.password) {
      userUpdata.password = Hash.make(data.password);
    }
    await this.userRepository.save(userUpdata);
    if (data.password) await this.revokeSessions(id);
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfile(id: string, data: any, actor: any) {
    id = entityId(id);
    assertOwner(actor, id);
    const target = await this.userRepository.findOne({ where: { id } });
    if (!target) throw new BadRequestException('User not found');
    data = accountProfileFields(actor, target, data);
    if (data.role !== undefined && data.role !== target.role)
      data.permissions = [];
    if (data.password) {
      data.password = await Hash.make(data.password);
    }

    await this.userRepository.update(id, data);
    if (data.password || data.role) await this.revokeSessions(id);

    return await this.userRepository.findOne({ where: { id } });
  }

  async forgotPassword(body: any) {
    allowedFields(body, ['email']);
    body.email = emailAddress(body.email);
    const cooldown = await this.redis.set(
      `forgot-cooldown:${body.email}`,
      '1',
      'EX',
      60,
      'NX',
    );
    if (!cooldown)
      throw new BadRequestException(
        'Please wait before requesting another code',
      );
    const user = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (!user) return false;

    // Tạo mã xác nhận (6 chữ số)
    const otp = randomInt(100000, 1000000).toString();

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
    allowedFields(body, ['email', 'otp', 'newPassword']);
    const email = emailAddress(body.email);
    const newPassword = passwordValue(body.newPassword);
    const otp = text(body.otp, 'OTP', 6, 6);
    if (!/^\d{6}$/.test(otp)) throw new BadRequestException('Invalid OTP');
    const attemptsKey = `forgot-attempts:${email}`;
    const attempts = await this.redis.incr(attemptsKey);
    if (attempts === 1) await this.redis.expire(attemptsKey, 300);
    if (attempts > 5) throw new BadRequestException('Too many attempts');

    // 1. Kiểm tra user tồn tại
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return {
        success: false,
        message: 'Người dùng không tồn tại.',
      };
    }

    // 2. Lấy OTP trong Redis
    if (user.role === 'super_admin' && newPassword.length < 12) {
      throw new BadRequestException(
        'Super admin password must have at least 12 characters',
      );
    }
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
    const consumed = await this.redis.eval(
      `if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
       return redis.call('DEL', KEYS[1])`,
      1,
      `forgot-password:${email}`,
      otp,
    );
    if (!consumed) throw new BadRequestException('OTP expired or already used');
    const hashedPassword = await Hash.make(newPassword);

    // 5. Lưu mật khẩu mới
    user.password = hashedPassword;
    await this.userRepository.save(user);
    await this.revokeSessions(user.id);

    // 6. Xóa OTP để tránh dùng lại

    return {
      success: true,
      message: 'Đặt lại mật khẩu thành công.',
    };
  }
}
