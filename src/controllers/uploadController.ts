import { Response } from 'express';
import { singleFileUpload } from '../utils/upload';
import { AuthRequest } from '../middleware/verifyJWT';

const uploadFile = (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No File Uploaded' });
  }

  return res.status(201).json({ image: req.file.filename });
};

const uploadMiddleware = singleFileUpload;

export {uploadFile, uploadMiddleware}
