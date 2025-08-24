import { Request, Response } from 'express';
import { getAllProductsService, getProductById } from '../../services/productService';
import mongoose from 'mongoose';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getAllProductsService();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid product id' });
      return;
    }
    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ message: `No product found with ID ${id}` });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
