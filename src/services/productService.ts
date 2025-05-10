import ProductModel, { Product } from '../models/Product';
import Category from '../models/Category';

export const getAllProductsService = async (): Promise<Product[]> => {
  return await ProductModel.find().populate('category', 'name').exec();
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  return await ProductModel.findById(productId).populate('category', 'name').exec();
};

export const createProductService = async (productData: Product): Promise<Product> => {
  const categoryExists = await Category.findById(productData.category).exec();
  if (!categoryExists) throw new Error('Category does not exist');

  return await ProductModel.create(productData);
};

export const updateProductById = async (productId: string, updatedData: Partial<Product>): Promise<Product | null> => {
  const existingProduct = await ProductModel.findById(productId).exec();
  if (!existingProduct) return null;

  // Handle countInStock as a change value
  if (updatedData.countInStock !== undefined) {
    const newStockValue = existingProduct.countInStock + updatedData.countInStock;
    if (newStockValue < 0) throw new Error('Stock cannot be negative');
    updatedData.countInStock = newStockValue;
  }

  return await ProductModel.findByIdAndUpdate(productId, updatedData, { new: true })
    .populate('category', 'name')
    .exec();
};

export const deleteProductById = async (productId: string): Promise<Product | null> => {
  return await ProductModel.findByIdAndDelete(productId).exec();
};
