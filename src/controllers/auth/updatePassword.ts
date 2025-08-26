import { AuthRequest } from '../../middleware/verifyJWT';
import { Response } from 'express';
import { PWD_REGEX } from '../../config/regex';
import UserModel from '../../models/User';
import { validatePassword, updateUserPassword } from '../../services/authServices';

/**
 * Update the authenticated user's password.
 *
 * Auth: requires a valid access token (sets `req.user` via verifyJWT).
 *
 * Request body:
 * - `password`     Current password (plaintext)
 * - `newPassword`  New password (plaintext)
 *
 * Responses:
 * - 200: { message: "Password updated successfully" }
 * - 400: missing fields / weak password / wrong current password
 * - 401: no authenticated user on request
 * - 404: user not found
 * - 500: unexpected error
 *
 * Security:
 * - Never log plaintext passwords.
 * - (Optional) Invalidate refresh tokens after password change to force re-login.
 */
export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { password, newPassword } = req.body as { password?: string; newPassword?: string };

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

    // verify current password
    const match = await validatePassword(password, user.password);
    if (!match) {
      res.status(400).json({ message: 'Incorrect current password' });
      return;
    }

    await updateUserPassword(userId, newPassword);

    // Force re-login everywhere:
    await UserModel.updateOne({ _id: userId }, { $unset: { refreshToken: '' } });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
