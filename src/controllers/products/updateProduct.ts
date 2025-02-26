import { Request, Response } from 'express';
import { updateProductById } from '../../services/productService';

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.params.id;
    const updatedData = req.body;

    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    const updatedProduct = await updateProductById(productId, updatedData);
    if (!updatedProduct) {
      res
        .status(404)
        .json({ message: 'Product not found or failed to update' });
      return;
    }

    res.json({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
