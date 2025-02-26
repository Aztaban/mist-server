import ProductModel, { Product } from '../models/Product';

export const getAllProductsService = async (): Promise<Product[]> => {
  return await ProductModel.find();
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  return await ProductModel.findById(productId).exec();
};

export const createProductService = async (productData: Product): Promise<Product> => {
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

  return await ProductModel.findByIdAndUpdate(productId, updatedData, { new: true }).exec();
};

export const deleteProductById = async (productId: string): Promise<Product | null> => {
  return await ProductModel.findByIdAndDelete(productId).exec();
};
