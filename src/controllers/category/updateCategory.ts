import { Request, Response } from 'express';
import * as categoryService from '../../services/categoryServices';

/**
 * Update a category's name.
 *
 * Route: PATCH /categories/:id
 *
 * Request:
 * - Params: { id: string }  // category id
 * - Body:   { name: string } // new display name
 *
 * Responses:
 * - 200 OK:   { message: 'Category updated successfully' }
 * - 400 Bad Request: missing/invalid id or name (and other validation errors)
 * - 404 Not Found:    category not found
 * - 500 Internal Server Error: unexpected failure (not currently emitted; see catch)
 *
 * Notes:
 * - If your model enforces unique `name`, Mongo will throw a duplicate key error
 *   (code 11000). Consider mapping that to 409 Conflict (see comment in catch).
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id) {
    res.status(400).json({ message: 'Category ID is required' });
    return;
  }

  // Basic name validation
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
    if (error?.code === 11000) {
      res.status(409).json({ message: 'Category name already exists.' });
      return;
    }
    res.status(400).json({ message: error.message });
  }
};
