import Category, { ICategory } from '../models/Category';
import Product from '../models/Product';
import mongoose from 'mongoose';

export const getAllCategories = async (): Promise<ICategory[]> => Category.find().sort({ name: 1 }).exec();

export const createCategory = async (name: string) => {
  return await Category.create({ name });
};

export const updateCategory = async (id: string, name: string): Promise<ICategory | null> =>
  Category.findByIdAndUpdate(id, { name }, { new: true, runValidators: true }).exec();

export const getCategoryById = async (id: string): Promise<ICategory | null> => Category.findById(id).exec();

export const deleteCategory = async (id: string): Promise<void> => {
  if (!mongoose.isValidObjectId(id)) throw new Error('Invalid category id');
  const inUse = await Product.exists({ category: id });
  if (inUse) {
    const err: any = new Error('Cannot delete category: products still reference it');
    err.code = 'CATEGORY_IN_USE';
    throw err;
  }
  await Category.findByIdAndDelete(id).exec();
};
