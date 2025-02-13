import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { singleFileUpload } from '../utils/upload';
import { AuthRequest } from '../middleware/verifyJWT';
import ProductModel from '../models/Product';

const uploadImage = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Respond with the filename so it can be stored in the frontend state
  return res.status(201).json({ image: req.file.filename });
};


const updateProductImage = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  console.log('Update Product Image:', id);

  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }

  try {
    const product = await ProductModel.findById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Delete the old image if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, '../../public/uploads/images', product.image);
      console.log('Deleting file:', imagePath);
      // Check if the file exists before deleting
      fs.stat(imagePath, (err, stats) => {
        if (!err && stats.isFile()) {
          fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting old image:', unlinkErr);
          });
        }
      });
    }
    console.log(req.file.filename)
    // Save new image filename in the database
    product.image = req.file.filename;
    await product.save();

    return res.status(200).json({ image: req.file.filename });
  } catch (error) {
    console.error('Error updating product image:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const uploadMiddleware = singleFileUpload;

export { uploadImage, updateProductImage, uploadMiddleware };
