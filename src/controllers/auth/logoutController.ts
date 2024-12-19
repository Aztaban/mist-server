import UserModel, { User } from '../../models/User';
import { Request, Response } from 'express';

const handleLogout = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;
  const refreshToken: string = cookies.jwt;

  if (!cookies?.jwt) {
    res.sendStatus(204); // No content
    return;
  }

  try {
    const foundUser: User | null = await UserModel.findOne({
      refreshToken,
    }).exec();
    if (!foundUser) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.sendStatus(204);
      return;
    }

    foundUser.refreshToken = '';
    const result = await foundUser.save();
    console.log(result);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export { handleLogout };
