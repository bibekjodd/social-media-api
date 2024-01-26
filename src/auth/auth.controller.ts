import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './auth.guard';
import { Request } from 'express';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    return { user: req.user || null };
  }

  @Get('logout')
  logout(@Req() req: Request) {
    req.session.destroy(() => {});
    return { message: 'Logged out successfully' };
  }
}
