import { imageSchema } from '@/users/user.dto';
import { z } from 'zod';

export const postsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => {
      const page = Number(value) || 1;
      if (page < 1) return 1;
      return page;
    }),
  page_size: z
    .string()
    .optional()
    .transform((value) => {
      const page_size = Number(value) || 20;
      if (page_size < 1 || page_size > 20) return 20;
      return page_size;
    }),
  author: z.string().optional()
});
export type PostsQuerySchema = z.infer<typeof postsQuerySchema>;

export const createPostSchema = z
  .object({
    caption: z.string().optional(),
    image: imageSchema.optional()
  })
  .refine((data) => {
    if (!data.caption && !data.image) return false;
    return true;
  }, 'At least one of image or caption is required');
export type CreatePostSchema = z.infer<typeof createPostSchema>;
