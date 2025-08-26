import { Request, Response } from 'express';
import * as categoryServices from '../../services/categoryServices';

/**
 * Create a new category.
 *
 * Route: POST /categories
 *
 * Request body:
 * - `name` (string, required): Display name of the category.
 *
 * Responses:
 * - 201 Created: returns the created category document
 * - 400 Bad Request: missing/invalid `name` or other validation error
 * - 500 Internal Server Error: unexpected failure (not currently emitted; see catch)
 *
 * Notes:
 * - If your Category schema has a unique index on `name`, Mongo will throw a
 *   duplicate key error (`err.code === 11000`). You may want to map that to
 *   `409 Conflict` instead of `400`. (See comment in the catch block.)
 */
export const addCategory = async (req: Request, res: Response) => {
  const { name } = req.body;

  // Basic input validation
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Name is required.' });
  }

  try {
    const newCategory = await categoryServices.createCategory(name);
    return res.status(201).json(newCategory);
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Category name already exists.' });
    }
    return res.status(400).json({ message: error.message });
  }
};
