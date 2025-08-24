import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { deleteProductById } from '../../services/productService';

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.body.id;
    if (!productId || !mongoose.isValidObjectId(productId)) {
      res.status(400).json({ message: 'Invalid product id' });
      return;
    }

    const deletedProduct = await deleteProductById(productId);
    if (!deletedProduct) {
      res.status(404).json({ message: `No product found with ID ${productId}` });
      return;
    }

    res.json({ message: 'Product deleted successfully', deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
