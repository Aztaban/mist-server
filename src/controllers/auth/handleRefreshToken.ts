import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import {
  AccessTokenPayload,
  generateAccessToken,
} from '../../services/authServices';
import { findUserByRefreshToken } from '../../services/userServices';
export const handleRefreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken: string = req.cookies?.jwt;

  if (!refreshToken) {
    res
      .status(401)
      .json({ message: 'Refresh token not found. Please log in again.' });
    return;
  }

  try {
    const foundUser = await findUserByRefreshToken(refreshToken);
    if (!foundUser) {
      res.status(401).json({ message: 'Forbidden: Invalid refresh token.' });
      return;
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as Secret,
      (err: any, decoded: any) => {
        if (err || foundUser.username !== decoded.username) {
          res
            .status(401)
            .json({ message: 'Forbidden: Invalid refresh token.' });
          return;
        }

        const roles: number[] = foundUser.roles || [];
        const accessTokenPayload: AccessTokenPayload = {
          UserInfo: { username: decoded.username, roles: roles },
        };

        const accessToken = generateAccessToken(accessTokenPayload);
        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    res.sendStatus(500);
  }
};
