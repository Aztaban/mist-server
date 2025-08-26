import Category, { ICategory } from '../models/Category';
import Product from '../models/Product';
import mongoose from 'mongoose';

/**
 * Fetch all categories sorted by name (ascending).
 * @returns Array of categories.
 */
export const getAllCategories = async (): Promise<ICategory[]> => Category.find().sort({ name: 1 }).exec();

/**
 * Create a new category.
 * @param name - Category display name.
 * @returns The created category document.
 * @throws ValidationError if the schema validation fails (e.g., required/unique).
 */
export const createCategory = async (name: string): Promise<ICategory> => {
  return await Category.create({ name });
};

/**
 * Update an existing category's name.
 * @param id - Category ObjectId (string).
 * @param name - New display name.
 * @returns The updated category, or `null` if not found.
 * @remarks Uses `{ new: true, runValidators: true }` so validators run on update.
 */
export const updateCategory = async (id: string, name: string): Promise<ICategory | null> =>
  Category.findByIdAndUpdate(id, { name }, { new: true, runValidators: true }).exec();

/**
 * Find a single category by id.
 * @param id - Category ObjectId (string).
 * @returns The category or `null` if not found.
 */
export const getCategoryById = async (id: string): Promise<ICategory | null> => Category.findById(id).exec();

/**
 * Delete a category if not referenced by any product.
 * @param id - Category ObjectId (string).
 * @throws Error with `message: 'Invalid category id'` if `id` is not a valid ObjectId.
 * @throws Error with `code = 'CATEGORY_IN_USE'` if any product references the category.
 */
export const deleteCategory = async (id: string): Promise<void> => {
  if (!mongoose.isValidObjectId(id)) throw new Error('Invalid category id');

  // Check referential integrity: products still linked?
  const inUse = await Product.exists({ category: id });
  if (inUse) {
    const err: any = new Error('Cannot delete category: products still reference it');
    err.code = 'CATEGORY_IN_USE';
    throw err;
  }

  await Category.findByIdAndDelete(id).exec();
};
