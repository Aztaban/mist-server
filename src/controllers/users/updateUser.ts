import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import {
  updateUserAddress,
  updateUserPhoneNumber,
  updateUserEmail,
  findUserByEmail,
} from '../../services/userServices';
import { validateAddress } from '../../utils/validateAddress';
import { Address } from '../../models/User';

/**
 * Update (or clear) the authenticated user's shipping address.
 *
 * Route: PATCH /users/me/address
 * Auth:  verifyJWT (sets `req.user`)
 *
 * Request body:
 * - `address`: Address object. If all fields are empty strings, the service clears the address.
 *
 * Responses:
 * - 200 OK: `{ message }` — "Address updated successfully" or "Address removed successfully"
 * - 401 Unauthorized: when `req.user` missing
 * - 400 Bad Request: invalid address payload
 * - 404 Not Found: user does not exist
 * - 5xx: delegated to global error handler
 */
export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      const err = new Error('Unauthorized: No user ID provided');
      (err as any).status = 401;
      throw err;
    }

    const { address } = req.body as { address?: Address };

    const isAddressEmpty = (addr: Partial<Address>) => Object.values(addr || {}).every((v) => v === '');

    // Validate only when there’s some non-empty content
    if (address && !isAddressEmpty(address)) {
      const { valid, message } = validateAddress(address);
      if (!valid) {
        const err = new Error(message || 'Invalid address');
        (err as any).status = 400;
        throw err;
      }
    }

    await updateUserAddress(userId, address ?? ({} as Address));

    res.status(200).json({
      message: !address || isAddressEmpty(address) ? 'Address removed successfully' : 'Address updated successfully',
    });
  } catch (error: any) {
    if (error?.message === 'User not found') {
      (error as any).status = 404;
    }
    next(error);
  }
};

/**
 * Update (or clear) the authenticated user's phone number.
 *
 * Route: PATCH /users/me/phone
 * Auth:  verifyJWT
 *
 * Request body:
 * - `phoneNumber`: string. Empty string clears the number. Otherwise must match `/^\+?\d{10,15}$/`.
 *
 * Responses:
 * - 200 OK: `{ message: 'Phone number updated successfully' }`
 * - 401 Unauthorized: when `req.user` missing
 * - 400 Bad Request: invalid phone format
 * - 404 Not Found: user does not exist
 * - 5xx: delegated to global error handler
 */
export const updatePhone = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      const err = new Error('Unauthorized: No user ID provided');
      (err as any).status = 401;
      throw err;
    }

    const { phoneNumber } = req.body as { phoneNumber?: string };

    // Allow clearing with empty string; validate only if non-empty string
    if (phoneNumber && phoneNumber !== '' && !/^\+?\d{10,15}$/.test(phoneNumber)) {
      const err = new Error('Invalid phone number format');
      (err as any).status = 400;
      throw err;
    }

    await updateUserPhoneNumber(userId, phoneNumber || '');
    res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error: any) {
    if (error?.message === 'User not found') {
      (error as any).status = 404;
    }
    next(error);
  }
};

/**
 * Update the authenticated user's email.
 *
 * Route: PATCH /users/me/email
 * Auth:  verifyJWT
 *
 * Request body:
 * - `email`: string (required, normalized to lowercase; simple regex validation)
 *
 * Responses:
 * - 200 OK: `{ message: 'Email updated successfully' }`
 * - 401 Unauthorized: when `req.user` missing
 * - 400 Bad Request: missing/invalid email
 * - 409 Conflict: email already in use by another user
 * - 5xx: delegated to global error handler
 */
export const updateEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      const err = new Error('Unauthorized: No user ID provided');
      (err as any).status = 401;
      throw err;
    }

    let { email } = req.body as { email?: string };
    if (!email) {
      const err = new Error('No email provided to update');
      (err as any).status = 400;
      throw err;
    }

    email = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // simple sanity check
    if (!emailRegex.test(email)) {
      const err = new Error('Invalid email format');
      (err as any).status = 400;
      throw err;
    }

    // Ensure not used by another account
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.id.toString() !== userId) {
      const err = new Error('Email already in use');
      (err as any).status = 409;
      throw err;
    }

    await updateUserEmail(userId, email);
    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error: any) {
    if (error?.code === 11000) {
      (error as any).status = 409;
      (error as any).message = 'Email already in use';
    }
    if (error?.message === 'User not found') {
      (error as any).status = 404;
    }
    next(error);
  }
};
