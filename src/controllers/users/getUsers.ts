import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import { findUserById, findAllUsers } from '../../services/userServices';

/**
 * Get the currently authenticated user's profile.
 *
 * Route: GET /users/me
 * Auth:  requires verifyJWT (sets `req.user`)
 *
 * Responses:
 * - 200 OK: user (without password/refreshToken)
 * - 401 Unauthorized: no authenticated user on the request
 * - 404 Not Found: user id not found
 * - 5xx: delegated to global error handler
 */
export const getUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      const err = new Error('Unauthorized: No user ID provided');
      (err as any).status = 401;
      throw err;
    }

    const user = await findUserById(userId);
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

/**
 * Get a user by id.
 *
 * Route: GET /users/:id
 * Auth:  usually protected (e.g., admin/editor); add `verifyRoles` in the router
 *
 * Responses:
 * - 200 OK: user (without sensitive fields)
 * - 400 Bad Request: missing/invalid id
 * - 404 Not Found: user not found
 * - 5xx: delegated to global error handler
 */
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid user id');
      (err as any).status = 400;
      throw err;
    }

    const user = await findUserById(id);
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

/**
 * List all users (without password/refreshToken).
 *
 * Route: GET /users
 * Auth:  typically admin-only; add `verifyJWT, verifyRoles(...)` in the router
 *
 * Responses:
 * - 200 OK: array of users (may be empty [])
 * - 5xx: delegated to global error handler
 */
export const getAllUsers = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await findAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
