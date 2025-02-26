import { Request, Response } from "express";
import { findUserByRefreshToken, clearUserRefreshToken } from "../../services/userServices";

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