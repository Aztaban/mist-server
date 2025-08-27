/** @packageDocumentation
 * User service: queries and mutations for users, excluding password hashes and refresh tokens
 * where appropriate. All functions return lean, typed results when possible.
 */

import UserModel, { User, Address } from '../models/User';
import { ROLES_LIST } from '../config/roles_list';

/**
 * Find a user by username (excludes refreshToken).
 * @param username - Unique username.
 * @returns The user or `null` if not found.
 */
export const findUserByUsername = async (username: string): Promise<User | null> => {
  return await UserModel.findOne({ username }).select('-refreshToken').exec();
};

/**
 * Find a user by id (excludes password & refreshToken).
 * @param id - User ObjectId as string.
 * @returns The user or `null` if not found.
 */
export const findUserById = async (id: string): Promise<User | null> => {
  return await UserModel.findById(id).select('-password -refreshToken').exec();
};

/**
 * Find a user by email (excludes refreshToken).
 * @param email - Email address.
 * @returns The user or `null` if not found.
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return await UserModel.findOne({ email }).select('-refreshToken').exec();
};

/**
 * Find a user by stored refresh token (used for session rotation).
 * @param refreshToken - The refresh token string.
 * @returns The user or `null` if not found.
 */
export const findUserByRefreshToken = async (refreshToken: string): Promise<User | null> => {
  return await UserModel.findOne({ refreshToken }).exec();
};

/**
 * Create a new user.
 * @param username - Username (must be unique).
 * @param email - Email address (must be unique).
 * @param password - Bcrypt-hashed password or plaintext if your model pre-save hook hashes it.
 * @returns The created user document.
 * @throws Duplicate key error (`code: 11000`) if username/email already exists.
 * @remarks Ensure hashing occurs at the model level (pre-save) or pass a hash here.
 */
export const createUser = async (username: string, email: string, password: string): Promise<User> => {
  return await UserModel.create({ username, email, password });
};

/**
 * Update a user's refresh token (stores/rotates token).
 * @param user - User document to mutate.
 * @param refreshToken - New refresh token value.
 * @returns The saved user document.
 */
export const updateUserRefreshToken = async (user: User, refreshToken: string): Promise<User> => {
  user.refreshToken = refreshToken;
  return await user.save();
};

/**
 * Clear a user's refresh token (logout all sessions if you store one token).
 * @param user - User document to mutate.
 * @returns The saved user document.
 */
export const clearUserRefreshToken = async (user: User): Promise<User> => {
  user.refreshToken = '';
  return await user.save();
};

/**
 * Upsert a user's address. If all fields are empty strings, clears the address.
 * @param userId - User id.
 * @param address - Address payload.
 * @returns The saved user document.
 * @throws Error if user is not found.
 */
export const updateUserAddress = async (userId: string, address: Address): Promise<User> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');

  const isAddressEmpty = (addr: Partial<Address>) => Object.values(addr || {}).every((v) => v === '');
  user.address = isAddressEmpty(address) ? undefined : address;

  return await user.save();
};

/**
 * Update a user's phone number.
 * @param userId - User id.
 * @param phoneNumber - New phone number (format validation is caller’s job).
 * @returns The saved user document.
 * @throws Error if user is not found.
 */
export const updateUserPhoneNumber = async (userId: string, phoneNumber: string): Promise<User> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');

  user.phoneNumber = phoneNumber;
  return await user.save();
};

/**
 * Update a user's email.
 * @param userId - User id.
 * @param email - New email.
 * @returns The saved user document.
 * @throws Error if user is not found or duplicate email (11000).
 */
export const updateUserEmail = async (userId: string, email: string): Promise<User> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');

  user.email = email;
  return await user.save();
};

/**
 * Set a user's active status.
 * @param id - User id.
 * @param isActive - New active flag.
 * @returns The updated user or `null` if not found.
 */
export const updateUserStatusService = async (id: string, isActive: boolean): Promise<User | null> => {
  return await UserModel.findByIdAndUpdate(id, { isActive }, { new: true }).exec();
};

/**
 * Toggle a user's active status (true ↔ false).
 * @param id - User id.
 * @returns The updated user (without password/refreshToken) or `null` if not found.
 */
export const toggleUserStatusService = async (id: string): Promise<User | null> => {
  const user = await UserModel.findById(id).select('-password -refreshToken');
  if (!user) return null;

  user.isActive = !user.isActive;
  await user.save();
  return user;
};

/**
 * Toggle the Editor role for a user.
 * - Adds Editor if missing; removes it if present.
 * @param id - User id.
 * @returns The updated user (without password/refreshToken) or `null` if not found.
 */
export const toggleEditorRoleService = async (id: string): Promise<User | null> => {
  const user = await UserModel.findById(id).select('-password -refreshToken');
  if (!user) return null;

  const editorRole = ROLES_LIST.Editor;
  user.roles = user.roles.includes(editorRole)
    ? user.roles.filter((role) => role !== editorRole)
    : [...user.roles, editorRole];

  await user.save();
  return user;
};

/**
 * List all users (excluding password & refreshToken).
 * @returns Array of users.
 * @remarks Consider pagination and role-based access in production.
 */
export const findAllUsers = async (): Promise<User[]> => {
  return await UserModel.find().select('-password -refreshToken').exec();
};
