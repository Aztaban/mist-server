import { Request, Response } from 'express';
import * as categoryServices from '../../services/categoryServices';

export const addCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name is required.' });
  }

  try {
    const newCategory = await categoryServices.createCategory(name);
    res.status(201).json(newCategory);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
