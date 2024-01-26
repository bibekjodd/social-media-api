import { z } from 'zod';

const commentSchema = z
  .string()
  .max(200, 'Too long comment')
  .min(1, "Comment can't be empty")
  .transform((value) => value.trim());

export const addCommentSchema = z.object({
  comment: commentSchema
});
export const addCommentQuery = z.object({
  parent_comment_id: z
    .string()
    .optional()
    .transform((value) => value || null)
});
export type AddCommentSchema = z.infer<typeof addCommentSchema>;
export type AddCommentQuery = z.infer<typeof addCommentQuery>;

export const queryCommentsSchema = z.object({
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
  parent_comment_id: z
    .string()
    .optional()
    .transform((value) => value || null)
});
export type QueryCommentsSchema = z.infer<typeof queryCommentsSchema>;
