import { Request, Response } from 'express';
import { findUserByRefreshToken, clearUserRefreshToken } from '../../services/userServices';

/**
 * Log out the current session by clearing the refresh token.
 *
 * Reads refresh token from the `jwt` httpOnly cookie. If missing,
 * responds 204 (nothing to do). If present, removes it both
 * server-side (DB) and client-side (clears cookie).
 *
 * Responses:
 * - 204 No Content (always; avoids leaking session existence)
 * - 500 Internal Server Error on unexpected failure
 */
export const handleLogout = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;
  const refreshToken = cookies?.jwt;

  if (!refreshToken) {
    res.sendStatus(204);
    return;
  }

  try {
    const foundUser = await findUserByRefreshToken(refreshToken);
    if (!foundUser) {
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
      res.sendStatus(204);
      return;
    }

    await clearUserRefreshToken(foundUser);
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};
