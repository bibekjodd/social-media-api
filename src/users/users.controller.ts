import { AuthenticatedGuard } from '@/auth/auth.guard';
import { ZodValidationPipe } from '@/pipe/zod-pipe';
import { UserSnapshot } from '@/schemas/user.schema';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';
import {
  ForgotPasswordSchema,
  RegisterUserSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  UpdateProfileSchema,
  forgotPasswordSchema,
  registerUserSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema
} from './user.dto';
import { UsersService } from './users.service';

@Controller('api')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  searchUsers(
    @Query() query: Record<string, string | undefined>
  ): Promise<{ users: UserSnapshot[] }> {
    return this.usersService.searchUsers(query);
  }

  @Post('register')
  registerUser(
    @Body(new ZodValidationPipe(registerUserSchema)) body: RegisterUserSchema
  ): Promise<{ user: UserSnapshot }> {
    return this.usersService.registerUser(body);
  }

  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  getProfile(@Req() req: Request) {
    return { user: req.user };
  }

  @Put('profile')
  @UseGuards(AuthenticatedGuard)
  updateProfile(
    @Req() req: Request,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileSchema
  ): Promise<{ user: UserSnapshot }> {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Delete('profile')
  deleteProfile(@Req() req: Request) {
    return this.usersService.deleteProfile(req.user.id);
  }

  @Put('password')
  @UseGuards(AuthenticatedGuard)
  updatePassword(
    @Req() req: Request,
    @Body(new ZodValidationPipe(updatePasswordSchema))
    body: UpdatePasswordSchema
  ) {
    return this.usersService.updatePassword(req.user.id, body);
  }

  @Post('password/forgot')
  forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    body: ForgotPasswordSchema
  ) {
    return this.usersService.forgotPassword(body);
  }

  @Put('password/reset')
  resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordSchema
  ): Promise<{ user: UserSnapshot }> {
    return this.usersService.resetPassword(body);
  }
}
