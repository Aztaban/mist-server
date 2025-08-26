import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import UserModel from '../models/User';
import type { AccessTokenPayload } from '../services/authServices';

export interface AuthRequest extends Request {
  user?: string;
  roles?: number[];
}

/**
 * Verify `Authorization: Bearer <token>` using ACCESS_TOKEN_SECRET.
 *
 * - 401 if header missing/invalid
 * - 403 if token invalid/expired or payload malformed
 * - 404 if the user referenced by the token no longer exists
 *
 * Attaches `req.user` (ObjectId string) and `req.roles` from DB, then calls `next()`.
 */
const verifyJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);

  const token = authHeader.slice(7); // strip "Bearer "
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as AccessTokenPayload;

    const username = decoded?.UserInfo?.username;
    if (!username) return res.sendStatus(403);

    // Fetch fresh user (ensures roles reflect DB, not stale token)
    const user = await UserModel.findOne({ username }).select('_id roles').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = String(user._id);
    req.roles = user.roles as number[] | undefined;

    return next();
  } catch (err) {
    // invalid/expired token, or verification error
    return res.sendStatus(403);
  }
};

export default verifyJWT;
