import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as categoryServices from '../../services/categoryServices';
import ProductModel from '../../models/Product';

export const removeCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const hasProducts = await ProductModel.exists({ category: id });
    if (hasProducts) {
      return res.status(409).json({ message: 'Category has products' });
    }

    await categoryServices.deleteCategory(id);
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    if (error?.code === 'CATEGORY_IN_USE') {
      return res.status(409).json({ message: 'Category has products' });
    }
    if (error?.message === 'Invalid category id') {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
