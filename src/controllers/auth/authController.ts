import UserModel, { User } from '../../model/User';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';

export interface AccessTokenPayload {
  UserInfo: {
    username: string;
    roles: number[];
  };
}

const handleLogin = async (req: Request, res: Response): Promise<void> => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    res.status(400).json({ message: 'Username and password are required.' });
    return;
  }

  try {
    const foundUser: User | null = await UserModel.findOne({
      username: user,
    }).exec();

    if (foundUser) {
      const match = await bcrypt.compare(pwd, foundUser.password);
      if (match) {
        const roles: number[] = Object.values(foundUser.roles).filter(Boolean);
        const accessTokenPayload: AccessTokenPayload = {
          UserInfo: {
            username: foundUser.username,
            roles: roles,
          },
        };

        const accessToken: string = jwt.sign(
          accessTokenPayload,
          process.env.ACCESS_TOKEN_SECRET as Secret,
          { expiresIn: '30s' }
        );

        const refreshToken: string = jwt.sign(
          { username: foundUser.username },
          process.env.REFRESH_TOKEN_SECRET as Secret,
          { expiresIn: '60s' }
        );

        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);
        console.log(roles);

        // Creates Secure Cookie with refresh token
        res.cookie('jwt', refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
        });

        // Send authorization roles and access token to user
        res.json({ accessToken });
      } else {
        res.sendStatus(401);
      }
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export { handleLogin };
