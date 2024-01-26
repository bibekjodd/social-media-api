import { z } from 'zod';

export const validateImageUrl = (url: string | undefined) => {
  const imageRegExp = new RegExp(`(https?://.*.(png|gif|webp|jpeg|jpg))`);
  const message = 'Invalid image url';
  const validator = z
    .string({ invalid_type_error: message })
    .regex(imageRegExp, message)
    .optional();
  return validator.parse(url);
};
