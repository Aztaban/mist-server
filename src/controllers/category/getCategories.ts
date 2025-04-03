import { Request, Response } from 'express';
import * as categoryServices from '../../services/categoryServices';

export const getCategories = async (req: Request, res: Response) => {
  const categories = await categoryServices.getAllCategories();
  res.json(categories);
};
