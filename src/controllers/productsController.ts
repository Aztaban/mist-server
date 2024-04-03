import ProductModel, { Product } from '../model/Product';
import { Request, Response } from 'express';

interface ProductRequest extends Request {
  body: Product;
}

// @desc Get all products
// @route GET /products
// @access Public
const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const products: Product[] = await ProductModel.find();
  if (products.length === 0) {
    res.status(204).json({ message: 'No products found' });
  } else {
    res.json(products);
  }
};

// @desc Create new product
// @route POST /products/
// @access Private
const createNewProduct = async (
  req: ProductRequest,
  res: Response
): Promise<void> => {
  try {
    const newProduct: Product = req.body;

    if (
      !newProduct.name ||
      !newProduct.productType ||
      !newProduct.image ||
      !newProduct.details.author
    ) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const createdProduct: Product = await ProductModel.create(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc Update product
// @route PATCH /products/:id
// @access Private
const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId: string = req.params.id;
    const updatedProductData: Product = req.body;

    // Check if the product ID is provided
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    // Check if the product with the given ID exists
    const existingProduct: Product | null = await ProductModel.findById(
      productId
    ).exec();
    if (!existingProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Update product
    const updatedProduct: Product | null = await ProductModel.findByIdAndUpdate(
      productId,
      updatedProductData
    ).exec();
    console.log(updatedProduct);

    // Check if the product was updated successfully
    if (!updatedProduct) {
      res.status(500).json({ message: 'Failed to update product' });
      return;
    } else {
      res.json({ message: 'Product updated successfully', updatedProduct });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc Delete product
// @route DELETE /products
// @access Private
const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const productId = req.body._id;
  if (!productId) {
    res.status(400).json({ message: `Product ID required` });
    return;
  }
  const deletedProduct: Product | null = await ProductModel.findByIdAndDelete(
    productId
  ).exec();
  if (!deletedProduct) {
    res.status(404).json({ message: `No product found with ID ${productId}` });
    return;
  } else {
    res.json({ message: 'Product deleted successfully', deletedProduct });
  }
};

// @desc Get product by ID
// @route get /products/:id
// @access Public
const getProduct = async (req: Request, res: Response): Promise<void> => {
  const productId = req.params.id;
  if (!productId) {
    res.status(400).json({ message: `Product ID required` });
    return;
  }
  const product: Product | null = await ProductModel.findById(productId).exec();
  if (!product) {
    res.status(400).json({ message: `No Product matches ID${productId}` });
    return;
  } else {
    res.json(product);
  }
};

const productsController = {
  getAllProducts,
  createNewProduct,
  updateProduct,
  deleteProduct,
  getProduct,
};

export default productsController;
