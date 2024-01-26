import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './auth.guard';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('api')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiTags('Login')
  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Req() req: Request) {
    return { user: req.user || null };
  }

  @ApiTags('Logout')
  @Get('logout')
  logout(@Req() req: Request) {
    req.session.destroy(() => {});
    return { message: 'Logged out successfully' };
  }
}
