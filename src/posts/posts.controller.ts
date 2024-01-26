import { AuthenticatedGuard } from '@/auth/auth.guard';
import { ZodValidationPipe } from '@/pipe/zod-pipe';
import { Post as TPost } from '@/schemas/post.schema';
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
import { Request } from 'express';
import {
  CreatePostSchema,
  PostsQuerySchema,
  createPostSchema,
  postsQuerySchema
} from './post.dto';
import { PostsService } from './posts.service';

@Controller('api')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get('posts')
  getPosts(
    @Req() req: Request,
    @Query(new ZodValidationPipe(postsQuerySchema)) query: PostsQuerySchema
  ) {
    return this.postsService.getPosts(query, req.user.id);
  }

  @Post('post')
  @UseGuards(AuthenticatedGuard)
  createPost(
    @Req() req: Request,
    @Body(new ZodValidationPipe(createPostSchema)) body: CreatePostSchema
  ): Promise<{ post: TPost }> {
    return this.postsService.createPost(body, req.user.id);
  }

  @Get('post/:id')
  getPost(@Req() req: Request, @Param('id') postId: string) {
    return this.postsService.getPost(postId, req.user?.id);
  }

  @Put('post/:id')
  @UseGuards(AuthenticatedGuard)
  updatePost(
    @Param('id') postId: string,
    @Req() req: Request,
    @Body(new ZodValidationPipe(createPostSchema)) body: CreatePostSchema
  ): Promise<{ post: TPost }> {
    return this.postsService.updatePost(postId, req.user.id, body);
  }

  @Delete('post/:id')
  @UseGuards(AuthenticatedGuard)
  deletePost(@Param('id') postId: string, @Req() req: Request) {
    return this.postsService.deletePost(postId, req.user.id);
  }
}
