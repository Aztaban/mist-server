import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { toggleUserStatusService } from '../../services/userServices';

/**
 * Toggle a user's active status (true ↔ false).
 *
 * Route: PATCH /users/:id/status
 * Auth:  protect in router (e.g., `verifyJWT, verifyRoles(Admin)`)
 *
 * Responses:
 * - 200 OK: updated user (without password/refreshToken)
 * - 400 Bad Request: invalid user id
 * - 404 Not Found: user not found
 * - 5xx: delegated to global error handler
 */
export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid ID');
      (err as any).status = 400;
      throw err;
    }

    const user = await toggleUserStatusService(id);
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
