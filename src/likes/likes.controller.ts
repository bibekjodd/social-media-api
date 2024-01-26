import { AuthenticatedGuard } from '@/auth/auth.guard';
import { ZodValidationPipe } from '@/pipe/zod-pipe';
import {
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  GetLikesDetailsQuery,
  GetLikesQuery,
  LikeUnlikeQuery,
  getLikesDetailsQuerySchema,
  getLikesQuery,
  likeUnlikeQuery
} from './like.dto';
import { LikesService } from './likes.service';

@Controller('api')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @ApiTags('Get total likes and like status')
  @Get('like/:id')
  getLikeStatus(
    @Req() req: Request,
    @Query(new ZodValidationPipe(getLikesQuery)) query: GetLikesQuery
  ): Promise<{ totalLikes: number; liked: boolean }> {
    return this.likesService.getLikeStatus({
      entityId: query.entity_id,
      isPost: query.is_post,
      userId: req.user?.id
    });
  }

  @ApiTags('Like/Unlike post/comment')
  @Put('like/:id')
  @UseGuards(AuthenticatedGuard)
  likeUnlike(
    @Req() req: Request,
    @Param('id') entityId: string,
    @Query(new ZodValidationPipe(likeUnlikeQuery)) query: LikeUnlikeQuery
  ): Promise<{ liked: boolean }> {
    return this.likesService.likeUnlike({
      userId: req.user.id,
      entityId,
      isPost: query.is_post,
      like: query.like
    });
  }

  @ApiTags('Get likes details of post or comment')
  @Get('likes/:id')
  getLikesDetails(
    @Req() req: Request,
    @Query(new ZodValidationPipe(getLikesDetailsQuerySchema))
    query: GetLikesDetailsQuery,
    @Param('id') entityId: string
  ) {
    return this.likesService.getLikesDetails({
      entityId,
      isPost: query.is_post,
      page: query.page,
      pageSize: query.page_size,
      userId: req.user?.id
    });
  }
}
