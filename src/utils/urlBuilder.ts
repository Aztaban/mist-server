import { Request } from 'express';

/**
 * Build a full absolute URL for an uploaded image, based on the current request.
 *
 * @param req - Express request (used for protocol + host)
 * @param filename - The stored image filename
 * @returns Full absolute URL like https://domain.com/uploads/images/filename.jpg
 */
export const buildImageUrl = (req: Request, filename: string): string => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/images/${filename}`;
};
