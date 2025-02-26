import UserModel, { User } from '../models/User';

export const findUserByUsername = async (username: string): Promise<User | null> => {
  return await UserModel.findOne({ username }).exec();
};

export const findUserByRefreshToken = async (refreshToken: string): Promise<User | null> => {
  return await UserModel.findOne({ refreshToken }).exec();
};

export const createUser = async (username: string, hashedPassword: string): Promise<User> => {
  return await UserModel.create({
    username,
    password: hashedPassword,
  });
};

export const updateUserRefreshToken = async (user: User, refreshToken: string): Promise<User> => {
  user.refreshToken = refreshToken;
  return await user.save();
};

export const clearUserRefreshToken = async (user: User): Promise<User> => {
  user.refreshToken = '';
  return await user.save();
};
