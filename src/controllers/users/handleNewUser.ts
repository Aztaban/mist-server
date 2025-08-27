import { Request, Response, NextFunction } from 'express';
import { hashPassword } from '../../services/authServices';
import { createUser, findUserByUsername, findUserByEmail } from '../../services/userServices';

/** Password policy: 8–24 chars, 1+ lower, upper, digit, special. */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

/**
 * Register a new user.
 *
 * Route: POST /auth/register
 *
 * Request body:
 * - `username`: string (required)
 * - `email`:    string (required)
 * - `pwd`:      string (required; must satisfy PASSWORD_REGEX)
 *
 * Responses:
 * - 201 Created: `{ success: "New user <username> created!" }`
 * - 400 Bad Request: missing fields / weak password / invalid email
 * - 409 Conflict: username or email already in use
 * - 5xx: delegated to global error handler
 */
export const handleNewUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { username, email, pwd } = req.body as {
      username?: string;
      email?: string;
      pwd?: string;
    };

    // Basic presence checks
    if (!username || !email || !pwd) {
      const err = new Error('Username, email and password are required');
      (err as any).status = 400;
      throw err;
    }

    // Normalize inputs
    username = String(username).trim();
    email = String(email).trim().toLowerCase();

    // Basic email sanity
    if (!email.includes('@') || email.startsWith('@') || email.endsWith('@')) {
      const err = new Error('Invalid email format');
      (err as any).status = 400;
      throw err;
    }

    // Password policy
    if (!PASSWORD_REGEX.test(pwd)) {
      const err = new Error(
        'Password must be 8–24 chars and include uppercase, lowercase, number, and special character'
      );
      (err as any).status = 400;
      throw err;
    }

    // Check for existing username/email (in parallel)
    const [existingUser, existingEmail] = await Promise.all([findUserByUsername(username), findUserByEmail(email)]);

    if (existingUser) {
      const err = new Error('Username already exists');
      (err as any).status = 409;
      throw err;
    }

    if (existingEmail) {
      const err = new Error('Email is already taken');
      (err as any).status = 409;
      throw err;
    }

    // Hash and create
    const passwordHash = await hashPassword(pwd);
    await createUser(username, email, passwordHash);

    res.status(201).json({ success: `New user ${username} created!` });
  } catch (error: any) {
    // Map DB duplicate-key fallback, in case race condition vs. unique indexes
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      (error as any).status = 409;
      (error as any).message = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`;
    }
    next(error);
  }
};
