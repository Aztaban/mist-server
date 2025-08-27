import ProductModel, { Product } from '../models/Product';
import Category from '../models/Category';

/**
 * Fetch all products with their category name populated.
 * @returns Array of products (may be empty).
 */
export const getAllProductsService = async (): Promise<Product[]> => {
  return await ProductModel.find().populate('category', 'name').exec();
};

/**
 * Fetch a single product by id with category name populated.
 * @param productId - Product ObjectId (string).
 * @returns The product or `null` if not found.
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  return await ProductModel.findById(productId).populate('category', 'name').exec();
};

/**
 * Create a new product.
 *
 * Validates that the referenced `category` exists before creating.
 *
 * @param productData - Full product payload.
 * @returns The created product document.
 * @throws Error if the referenced category does not exist.
 */
export const createProductService = async (productData: Product): Promise<Product> => {
  const categoryExists = await Category.findById(productData.category).exec();
  if (!categoryExists) throw new Error('Category does not exist');

  return await ProductModel.create(productData);
};

/**
 * Update a product by id.
 *
 * Special handling for `countInStock`:
 * - If `updatedData.countInStock` is provided, it is treated as a **delta**
 *   (change value) relative to the existing stock, not an absolute value.
 *   The resulting stock must not be negative.
 *
 * @param productId - Product id.
 * @param updatedData - Fields to update; `countInStock` is interpreted as a delta.
 * @returns Updated product (with category name populated) or `null` if not found.
 * @throws Error if the resulting stock would be negative.
 */
export const updateProductById = async (productId: string, updatedData: Partial<Product>): Promise<Product | null> => {
  const existingProduct = await ProductModel.findById(productId).exec();
  if (!existingProduct) return null;

  // Treat provided countInStock as a delta (e.g., +5 / -2)
  if (updatedData.countInStock !== undefined) {
    const newStockValue = existingProduct.countInStock + updatedData.countInStock;
    if (newStockValue < 0) throw new Error('Stock cannot be negative');
    updatedData.countInStock = newStockValue;
  }

  return await ProductModel.findByIdAndUpdate(productId, updatedData, { new: true })
    .populate('category', 'name')
    .exec();
};

/**
 * Delete a product by id.
 * @param productId - Product id.
 * @returns Deleted product or `null` if not found.
 */
export const deleteProductById = async (productId: string): Promise<Product | null> => {
  return await ProductModel.findByIdAndDelete(productId).exec();
};
