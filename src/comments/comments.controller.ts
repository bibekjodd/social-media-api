import { AuthenticatedGuard } from '@/auth/auth.guard';
import { ZodValidationPipe } from '@/pipe/zod-pipe';
import { Comment } from '@/schemas/comment.schema';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import {
  AddCommentQuery,
  AddCommentSchema,
  QueryCommentsSchema,
  addCommentQuery,
  addCommentSchema,
  queryCommentsSchema
} from './comment.dto';
import { CommentsService } from './comments.service';

@Controller('api')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @ApiTags('Add comment or add reply to the comment')
  @Post('comment/:id')
  @UseGuards(AuthenticatedGuard)
  addComment(
    @Param('id') postId: string,
    @Req() req: Request,
    @Query(new ZodValidationPipe(addCommentQuery)) query: AddCommentQuery,
    @Body(new ZodValidationPipe(addCommentSchema)) body: AddCommentSchema
  ): Promise<{ comment: Comment }> {
    return this.commentsService.addComment({
      postId,
      userId: req.user.id,
      comment: body.comment,
      parentCommentId: query.parent_comment_id
    });
  }

  @ApiTags('Query comments')
  @Get('comments/:id')
  getComments(
    @Query(new ZodValidationPipe(queryCommentsSchema))
    query: QueryCommentsSchema,
    @Req() req: Request,
    @Param('id') postId: string
  ) {
    return this.commentsService.getComments({
      ...query,
      userId: req.user?.id,
      postId
    });
  }

  @ApiTags('Edit comment')
  @Put('comment/:id')
  @UseGuards(AuthenticatedGuard)
  editComment(
    @Req() req: Request,
    @Param('id') commentId: string,
    @Body(new ZodValidationPipe(addCommentSchema)) body: AddCommentSchema
  ) {
    return this.commentsService.editComment({
      comment: body.comment,
      commentId,
      userId: req.user.id
    });
  }

  @ApiTags('Delete comment')
  @Delete('comment/:id')
  @UseGuards(AuthenticatedGuard)
  deleteComment(@Req() req: Request, @Param('id') commentId: string) {
    return this.commentsService.deleteComment(req.user.id, commentId);
  }
}
