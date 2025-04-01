import { Response } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import * as uploadService from '../../services/uploadServices';

/**
 * Controller for handling image uploads.
 */
export const handleImageUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = await uploadService.saveFile(req.file);
    return res.status(201).json({ image: filename });

  } catch (error) {
    console.error('Upload Error:', error);

    // Check if error has a message, otherwise use a generic one
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred';

    return res.status(500).json({ error: errorMessage });
  }
};

/**
 * Controller for updating product images.
 */
export const handleProductImageUpdate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = await uploadService.updateProductImage(req.params.id, req.file!);
    res.status(200).json({ image: filename });
  } catch (error) {
    console.error('Error updating product image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
    res.status(500).json({ error: errorMessage });
  }
};