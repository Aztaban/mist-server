import { Request, Response } from 'express';
import * as categoryServices from '../../services/categoryServices';

/**
 * List all categories sorted by name.
 *
 * Route: GET /categories
 *
 * Responses:
 * - 200 OK: array of categories
 * - 500 Internal Server Error: unexpected failure
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryServices.getAllCategories();
    return res.json(categories);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching categories:', err);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};
