import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as categoryServices from '../../services/categoryServices';
import ProductModel from '../../models/Product';

/**
 * Delete a category by id.
 *
 * Route: DELETE /categories/:id
 *
 * Behavior:
 * - 400 if `id` is missing or not a valid ObjectId.
 * - 409 if any product still references the category.
 * - 200 on success (returns a JSON message).
 *
 * Notes:
 * - You already guard against products referencing the category here
 *   *and* the service also guards (throws with `code = 'CATEGORY_IN_USE'`).
 *   You could remove the local `hasProducts` pre-check and rely on the service
 *   to be the single source of truth (less duplicate logic).
 * - Many APIs prefer `204 No Content` on successful deletion. Keeping `200`
 *   with a message is fine if your client expects it.
 */
export const removeCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate id shape early
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const hasProducts = await ProductModel.exists({ category: id });
    if (hasProducts) {
      return res.status(409).json({ message: 'Category has products' });
    }

    await categoryServices.deleteCategory(id);

    return res.status(204).json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    // Service-level guard surfaced
    if (error?.code === 'CATEGORY_IN_USE') {
      return res.status(409).json({ message: 'Category has products' });
    }
    if (error?.message === 'Invalid category id') {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    // Fallback
    // eslint-disable-next-line no-console
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
