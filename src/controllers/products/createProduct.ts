import { Request, Response } from 'express';
import { createProductService } from '../../services/productService';
import Category from '../../models/Category';

export const createNewProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct = req.body;

    if (!newProduct.name || !newProduct.category || !newProduct.image || !newProduct.details?.author) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const categoryExist = await Category.findById(newProduct.category).exec();
    if (!categoryExist) {
      res.status(400).json({ message: 'Category does not exist' });
      return;
    }

    const createdProduct = await createProductService(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
