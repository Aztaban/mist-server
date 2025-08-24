import { Request, Response } from 'express';
import { createProductService } from '../../services/productService';
import Category from '../../models/Category';
import mongoose from 'mongoose';

export const createNewProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct = req.body;

    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.image ||
      !newProduct.details?.author ||
      newProduct.price == null
    ) {
      res.status(400).json({ message: 'Missing: name, category, image, details.author, price' });
      return;
    }

    if (!mongoose.isValidObjectId(newProduct.category)) {
      res.status(400).json({ message: 'Invalid category id' });
      return;
    }

    const categoryExist = await Category.findById(newProduct.category).lean().exec();
    if (!categoryExist) {
      res.status(400).json({ message: 'Category does not exist' });
      return;
    }

    const createdProduct = await createProductService(newProduct);
    res.status(201).json(createdProduct);
  } catch (error: any) {
    if (error?.message === 'Category does not exist') {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
