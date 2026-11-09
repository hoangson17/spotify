import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  GoogleCallbackQueryDto,
  GoogleExchangeDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/redirect')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async google(@Res() res: Response, @Request() req: any) {
    const state = randomUUID();
    res.cookie('google_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.secure,
      maxAge: 600000,
      path: '/auth/google',
    });
    const url = await this.authService.googleRedirect(state);
    return res.redirect(url);
  }

  @Get('google/callback')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async googleCallback(
    @Query() query: GoogleCallbackQueryDto,
    @Res() res: Response,
    @Request() req: any,
  ) {
    const cookie = String(req.headers.cookie ?? '')
      .split(';')
      .map((part: string) => part.trim())
      .find((part: string) => part.startsWith('google_oauth_state='))
      ?.split('=')[1];
    res.clearCookie('google_oauth_state', { path: '/auth/google' });
    if (!query.state || cookie !== query.state)
      throw new UnauthorizedException('Invalid OAuth state');
    await this.authService.consumeGoogleState(query.state);
    const code = query.code;
    const tokenData = await this.authService.googleCallback(code);
    if (!tokenData) {
      throw new UnauthorizedException('Google authorization failed');
    }
    const accessToken = (tokenData as { access_token: string }).access_token;
    const loginCode = await this.authService.googleExchangeCode(accessToken);
    const frontendUrl = new URL(process.env.GOOGLE_FRONTEND_URL as string);
    frontendUrl.searchParams.set('code', loginCode);
    return res.redirect(frontendUrl.toString());
  }

  @Post('google/callback')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async googleCallbackPost(@Body() body: GoogleExchangeDto) {
    return this.authService.exchangeGoogleLogin(body);
  }

  @Post('login')
  @Throttle({
    default: { limit: 5, ttl: 60_000, blockDuration: 5 * 60_000 },
  })
  async login(@Body() body: LoginDto) {
    const attempt = await this.authService.login(body);
    if (!attempt) {
      throw new UnauthorizedException('Email hoac mat khau khong chinh xac');
    }
    return attempt;
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  profile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Patch('/profile/:id')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: UpdateProfileDto,
    @Request() req: any,
  ) {
    return this.authService.updateProfile(id, body, req.user);
  }

  @Post('/refresh-token')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refeshToken(@Body() body: RefreshTokenDto) {
    const result = await this.authService.refreshToken(body);
    if (!result) {
      throw new UnauthorizedException('Refresh token khong hop le');
    }
    return result;
  }

  @Post('/forgot-password')
  @Throttle({
    default: { limit: 5, ttl: 10 * 60_000, blockDuration: 10 * 60_000 },
  })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('/reset-password')
  @Throttle({ default: { limit: 10, ttl: 10 * 60_000 } })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @UseGuards(AuthGuard)
  @Post('/logout')
  logout(@Request() req: any) {
    return this.authService.logout(req.user);
  }

  @UseGuards(AuthGuard)
  @Patch('/profile')
  async updateUser(@Request() req: any, @Body() body: UpdateProfileDto) {
    const data = await this.authService.updateUser(req.user, body);
    if (!data) {
      return {
        success: false,
        message: 'Email da ton tai',
      };
    }
    return {
      success: true,
      data: data,
    };
  }
}
