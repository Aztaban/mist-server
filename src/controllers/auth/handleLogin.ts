import { Request, Response } from 'express';
import { findUserByUsername, updateUserRefreshToken, findUserByEmail } from '../../services/userServices';
import { validatePassword, generateAccessToken, generateRefreshToken } from '../../services/authServices';
import { AccessTokenPayload } from '../../services/authServices';
import { ROLES_LIST } from '../../config/roles_list';

export const handleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user, email, pwd } = req.body;

  if ((!user && !email) || !pwd) {
    res.status(400).json({ message: 'Email or username and password are required.' });
    return;
  }

  try {
    let foundUser = null;
    if (email) {
      foundUser = await findUserByEmail(email);
    } else if (user) {
      foundUser = await findUserByUsername(user);
    }

    if (!foundUser) {
      res.status(401).json({ message: 'Unauthorized: User not found.' });
      return;
    }

    const match = await validatePassword(pwd, foundUser.password);
    if (!match) {
      res.status(401).json({ message: 'Unauthorized: Invalid password.' });
      return;
    }

    const roles: number[] = foundUser.roles || [];
    const accessTokenPayload: AccessTokenPayload = {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    };

    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(foundUser.username);

    await updateUserRefreshToken(foundUser, refreshToken);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const isAdmin = roles.some(role => [ROLES_LIST.Admin, ROLES_LIST.Editor].includes(role));

    res.json({ accessToken, isAdmin });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};
