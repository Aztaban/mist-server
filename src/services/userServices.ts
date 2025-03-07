import UserModel, { User, Address } from '../models/User';
import { Types } from 'mongoose';
import { ROLES_LIST } from '../config/roles_list';

export const findUserByUsername = async (
  username: string
): Promise<User | null> => {
  return await UserModel.findOne({ username }).select('-refreshToken').exec();
};

export const findUserById = async (id: string) => {
  return await UserModel.findById(id).select('-password -refreshToken').exec();
};

export const findUserByEmail = async (email: string) => {
  return await UserModel.findOne({ email }).select('-refreshToken').exec();
};

export const findUserByRefreshToken = async (
  refreshToken: string
): Promise<User | null> => {
  return await UserModel.findOne({ refreshToken }).exec();
};

export const createUser = async (
  username: string,
  email: string,
  password: string
): Promise<User> => {
  return await UserModel.create({
    username,
    email,
    password,
  });
};

export const updateUserRefreshToken = async (
  user: User,
  refreshToken: string
): Promise<User> => {
  user.refreshToken = refreshToken;
  return await user.save();
};

export const clearUserRefreshToken = async (user: User): Promise<User> => {
  user.refreshToken = '';
  return await user.save();
};

export const updateUserContactInfo = async (
  userId: string,
  address?: Address,
  phoneNumber?: string
): Promise<User> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (address) {
    user.address = address;
  }
  if (phoneNumber) {
    user.phoneNumber = phoneNumber;
  }
  return await user.save();
};

export const updateUserStatusService = async (id: string, isActive: boolean) => {
  return await UserModel.findByIdAndUpdate(id, { isActive }, { new: true });
};

export const toggleUserStatusService = async (id: string) => {
  const user = await UserModel.findById(id).select('-password -refreshToken');
  if (!user) return null;

  user.isActive = !user.isActive;
  await user.save();
  return user;
};

export const toggleEditorRoleService = async (id: string) => {
  const user = await UserModel.findById(id).select('-password -refreshToken');
  if (!user) return null;

  const editorRole = ROLES_LIST.Editor;

  if (user.roles.includes(editorRole)) {
    user.roles = user.roles.filter(role => role !== editorRole);
  } else {
    user.roles.push(editorRole);
  }

  await user.save();
  return user;
};

export const findAllUsers = async (): Promise<User[]> => {
  return await UserModel.find().select("-password -refreshToken").exec();
};