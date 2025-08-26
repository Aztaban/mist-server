import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { AccessTokenPayload, generateAccessToken } from '../../services/authServices';
import { findUserByRefreshToken } from '../../services/userServices';

/**
 * Exchange a valid refresh token for a new access token.
 *
 * Reads `jwt` httpOnly cookie, verifies it with `REFRESH_TOKEN_SECRET`,
 * matches the token to a user in DB, and issues a new access token.
 *
 * Responses:
 * - 200 OK: `{ accessToken, isAdmin }` (or roles)
 * - 401 Unauthorized: no cookie / token missing
 * - 403 Forbidden: invalid or mismatched refresh token
 * - 500 Internal Server Error: unexpected failure
 *
 * Security:
 * - Do NOT return the refresh token in JSON.
 * - Optionally rotate refresh tokens here (issue a new refresh, persist, set cookie).
 * - If using rotation, be sure to invalidate old ones to prevent reuse.
 */
export const handleRefreshToken = async (req: Request, res: Response): Promise<void> => {
  const refreshToken: string = req.cookies?.jwt;

  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token not found. Please log in again.' });
    return;
  }

  try {
    const foundUser = await findUserByRefreshToken(refreshToken);
    if (!foundUser) {
      res.status(401).json({ message: 'Forbidden: Invalid refresh token.' });
      return;
    }

    // Verified refresh token → issue a new access token.
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as Secret, (err: any, decoded: any) => {
      if (err || foundUser.username !== decoded.username) {
        res.status(401).json({ message: 'Forbidden: Invalid refresh token.' });
        return;
      }

      const roles: number[] = foundUser.roles || [];
      const accessTokenPayload: AccessTokenPayload = {
        UserInfo: { username: decoded.username, roles: roles },
      };

      const accessToken = generateAccessToken(accessTokenPayload);
      res.json({ accessToken });
    });
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    res.sendStatus(500);
  }
};
