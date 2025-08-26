import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import UserModel, { User } from '../models/User';

/**
 * Shape of the JWT access token payload issued by this service.
 * Extend cautiously—any change affects verifiers and middleware.
 */
export interface AccessTokenPayload {
  UserInfo: {
    username: string;
    roles: number[];
  };
}

/**
 * Compare a plaintext password with a bcrypt hash.
 *
 * @param password - User-entered plaintext password.
 * @param hashedPassword - Stored bcrypt hash.
 * @returns Resolves to `true` if they match; otherwise `false`.
 */
export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Hash a plaintext password with bcrypt.
 *
 * @param password - Plaintext password to hash.
 * @returns The bcrypt hash string.
 * @remarks Uses 10 salt rounds by default.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

/**
 * Generate a short-lived JWT access token.
 *
 * @param payload - Claims to embed (username + roles).
 * @returns A signed JWT string.
 * @throws If `ACCESS_TOKEN_SECRET` is missing or invalid.
 * @remarks Default expiry is 15 minutes.
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as Secret, { expiresIn: '15m' });
};

/**
 * Generate a refresh token for session renewal.
 *
 * @param username - Username to embed in the token payload.
 * @returns A signed JWT string.
 * @throws If `REFRESH_TOKEN_SECRET` is missing or invalid.
 * @remarks Default expiry is 24 hours. Store/rotate securely (e.g., httpOnly cookie).
 */
export const generateRefreshToken = (username: string): string => {
  return jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET as Secret, { expiresIn: '24h' });
};

/**
 * Update a user's password, persisting a new bcrypt hash.
 *
 * @param userId - MongoDB ObjectId string of the user.
 * @param newPassword - New plaintext password to set.
 * @returns The updated `User` document.
 * @throws If the user does not exist.
 */
export const updateUserPassword = async (userId: string, newPassword: string): Promise<User> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.password = await hashPassword(newPassword);
  return await user.save();
};
