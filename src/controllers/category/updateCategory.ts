import { Request, Response } from 'express';
import * as categoryService from '../../services/categoryServices';

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  if (!id) {
    res.status(400).json({ message: 'Category ID is required' });
    return;
  }

  if (!name || typeof name !== 'string') {
    res.status(400).json({ message: 'New name is required.' });
    return;
  }

  try {
    const updated = await categoryService.updateCategory(id, name);
    if (!updated) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
