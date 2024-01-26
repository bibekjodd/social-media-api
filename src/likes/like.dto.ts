import { z } from 'zod';

export const getLikesQuery = z.object({
  is_post: z
    .string()
    .optional()
    .transform((value) => (value === 'true' ? true : false)),
  entity_id: z.string({ required_error: 'Like or comment id is required' })
});
export type GetLikesQuery = z.infer<typeof getLikesQuery>;

export const likeUnlikeQuery = z.object({
  like: z
    .string()
    .optional()
    .transform((value) => (value === 'true' ? true : false)),
  is_post: z
    .string()
    .optional()
    .transform((value) => (value === 'true' ? true : false))
});
export type LikeUnlikeQuery = z.infer<typeof likeUnlikeQuery>;

export const getLikesDetailsQuerySchema = z.object({
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
      const page_size = Number(value) || 1;
      if (page_size < 1 || page_size > 20) return 20;
      return page_size;
    }),
  is_post: z
    .string()
    .optional()
    .transform((value) => (value === 'true' ? true : false))
});
export type GetLikesDetailsQuery = z.infer<typeof getLikesDetailsQuerySchema>;
