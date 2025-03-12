import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import UserModel, { User } from '../models/User';

export interface AccessTokenPayload {
  UserInfo: {
    username: string;
    roles: number[];
  };
}

export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as Secret, { expiresIn: '15m' });
};

export const generateRefreshToken = (username: string): string => {
  return jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET as Secret, { expiresIn: '24h' });
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<User> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  user.password = await hashPassword(newPassword);
  return await user.save();
};