import { Body, Controller, Get, Param, Patch, Post, Query, Req, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Get('google/redirect')
  google(@Res() res: Response) {
    const url = this.authService.googleRedirect();
    return res.redirect(url);
  }

  @Get('google/callback')
  async googleCallback(@Query() query: { code: string }, @Res() res: Response) {
    const code = query.code;
    const tokenData = await this.authService.googleCallback(code);
    if (!tokenData) {
      throw new Error("Can't get token");
    }
    const accessToken = (tokenData as { access_token: string }).access_token;
    return res.redirect(process.env.GOOGLE_FRONTEND_URL + `?accessToken=${accessToken}`);
  }

   @Post('google/callback')
  async googleCallbackPost(@Body() { accessToken }: { accessToken: string }) {
    return this.authService.googleLogin(accessToken);
  }

  @Post('login')
  async login(@Body() body: any) {
    const attempt = await this.authService.login(body);
    if (!attempt) {
      throw new UnauthorizedException('Email hoac mat khau khong chinh xac');
    }
    return attempt;
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  profile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Patch('/profile/:id')
  async updateProfile(@Param('id') id: number, @Body() body: any) {
    return this.authService.updateProfile(id, body);
  }

  @Post('/refresh-token')
  async refeshToken(@Body() body: any) {
    const result = await this.authService.refreshToken(body);
    if(!result){
      throw new UnauthorizedException('Refresh token khong hop le');
    }
    return result;
  }

}
