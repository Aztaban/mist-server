import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { deleteProductById } from '../../services/productService';

/**
 * DELETE /products/:id
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid product id');
      (err as any).status = 400;
      throw err;
    }

    const deleted = await deleteProductById(id);
    if (!deleted) {
      const err = new Error(`No product found with ID ${id}`);
      (err as any).status = 404;
      throw err;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
