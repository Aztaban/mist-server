import Category, { ICategory } from '../models/Category';

export const getAllCategories = async (): Promise<ICategory[]> => {
  return await Category.find().select('-__v').sort({ name: 1 }).exec();
};

export const createCategory = async (name: string) => {
  return await Category.create({ name });
};

export const deleteCategory = async (id: string): Promise<void> => {
  await Category.findByIdAndDelete(id);
};

export const getCategoryById = async (id: string): Promise<ICategory | null> => {
  return await Category.findById(id);
};

export const updateCategory = async (id: string, name: string): Promise<ICategory | null> => {
  return await Category.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
};
