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
import { ApiTags } from '@nestjs/swagger';

@Controller('api')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiTags('Query users')
  @Get('search')
  searchUsers(
    @Query() query: Record<string, string | undefined>
  ): Promise<{ users: UserSnapshot[] }> {
    return this.usersService.searchUsers(query);
  }

  @ApiTags('Register')
  @Post('register')
  registerUser(
    @Body(new ZodValidationPipe(registerUserSchema)) body: RegisterUserSchema
  ): Promise<{ user: UserSnapshot }> {
    return this.usersService.registerUser(body);
  }

  @ApiTags('Get profile')
  @Get('profile')
  @UseGuards(AuthenticatedGuard)
  getProfile(@Req() req: Request) {
    return { user: req.user };
  }

  @ApiTags('Update profile')
  @Put('profile')
  @UseGuards(AuthenticatedGuard)
  updateProfile(
    @Req() req: Request,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileSchema
  ): Promise<{ user: UserSnapshot }> {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @ApiTags('Delete profile')
  @Delete('profile')
  @UseGuards(AuthenticatedGuard)
  deleteProfile(@Req() req: Request) {
    return this.usersService.deleteProfile(req.user.id);
  }

  @ApiTags('Update Password')
  @Put('password')
  @UseGuards(AuthenticatedGuard)
  updatePassword(
    @Req() req: Request,
    @Body(new ZodValidationPipe(updatePasswordSchema))
    body: UpdatePasswordSchema
  ) {
    return this.usersService.updatePassword(req.user.id, body);
  }

  @ApiTags('Forgot password')
  @Post('password/forgot')
  forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema))
    body: ForgotPasswordSchema
  ) {
    return this.usersService.forgotPassword(body);
  }

  @ApiTags('Reset password')
  @Put('password/reset')
  resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordSchema
  ): Promise<{ user: UserSnapshot }> {
    return this.usersService.resetPassword(body);
  }
}
