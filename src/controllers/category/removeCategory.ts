import { Request, Response } from 'express';
import * as categoryServices from '../../services/categoryServices';
import ProductModel from '../../models/Product';

export const removeCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const hasProducts = await ProductModel.exists({ category: id });

  if (hasProducts) {
    return res.status(400).json({ message: 'Category has products' });
  }

  await categoryServices.deleteCategory(id);
  res.sendStatus(200).json({ message: 'Category deleted succesfully' });
};
