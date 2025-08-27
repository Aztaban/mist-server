import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { toggleEditorRoleService } from '../../services/userServices';

/**
 * Toggle the Editor role for a user (add if missing, remove if present).
 *
 * Route: PATCH /users/:id/roles/editor
 * Auth:  protect in router with `verifyJWT, verifyRoles(Admin)`
 *
 * Responses:
 * - 200 OK: updated user (without password/refreshToken)
 * - 400 Bad Request: invalid user id
 * - 404 Not Found: user not found
 * - 5xx: delegated to global error handler
 */
export const toggleEditorRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid ID');
      (err as any).status = 400;
      throw err;
    }

    const user = await toggleEditorRoleService(id);
    if (!user) {
      const err = new Error('User not found');
      (err as any).status = 404;
      throw err;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
