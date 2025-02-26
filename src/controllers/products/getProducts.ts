import { Request, Response } from "express";
import { getAllProductsService, getProductById } from "../../services/productService";

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await getAllProductsService();
    if (products.length === 0) {
      res.status(204).json({ message: 'No products found' });
      return;
    }
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      res.status(404).json({ message: `No product found with ID ${req.params.id}` });
      return;
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};