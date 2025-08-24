import mongoose from 'mongoose';
import Category from '../../models/Category';
import { Request, Response } from 'express';
import { updateProductById } from '../../services/productService';

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    if (!productId || !mongoose.isValidObjectId(productId)) {
      res.status(400).json({ message: 'Invalid product id' });
      return;
    }

    const updatedData = req.body;
    if (updatedData?.category) {
      if (!mongoose.isValidObjectId(updatedData.category)) {
        res.status(400).json({ message: 'Invalid category id' });
        return;
      }
      const cat = await Category.findById(updatedData.category).lean().exec();
      if (!cat) {
        res.status(400).json({ message: 'Category does not exist' });
        return;
      }
    }

    const updatedProduct = await updateProductById(productId, updatedData);
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found or failed to update' });
      return;
    }

    res.json({ message: 'Product updated successfully', updatedProduct });
  } catch (error: any) {
    if (error?.message === 'Stock cannot be negative') {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
