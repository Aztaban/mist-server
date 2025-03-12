import { AuthRequest } from '../../middleware/verifyJWT';
import { Response } from 'express';
import { PWD_REGEX } from '../../config/regex';
import UserModel from '../../models/User';
import {
  validatePassword,
  updateUserPassword,
  hashPassword,
} from '../../services/authServices';

export const updatePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      res.status(400).json({ message: 'No passwords provided to update' });
      return;
    }
    if (!PWD_REGEX.test(newPassword)) {
      res.status(400).json({
        message:
          'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character',
      });
      return;
    }

    const userId = req.user;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID provided' });
      return;
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const match = await validatePassword(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Incorrect current password' });
      return;
    }
    await updateUserPassword(userId, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
