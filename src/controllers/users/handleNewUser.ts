import { Request, Response } from "express";
import { hashPassword } from "../../services/authServices";
import { createUser, findUserByUsername, findUserByEmail } from "../../services/userServices";

const validatePasswordInput = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
  return passwordRegex.test(password);
};

export const handleNewUser = async (req: Request, res: Response): Promise<void> => {
  const { username, email, pwd } = req.body;

  if (!username || !email || !pwd) {
    res.status(400).json({ message: 'Username, email and password are required' });
    return;
  }

  if (!validatePasswordInput(pwd)) {
    res.status(400).json({ message: "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character" });
    return;
  }

  try {
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      res.sendStatus(409).json({ message: 'Username already exists' });
      return;
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      res.sendStatus(409).json({ message: 'Email is already taken' });
      return;
    }

    const password = await hashPassword(pwd);
    const newUser = await createUser(username, email, password);

    res.status(201).json({ success: `New user ${username} created!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating new user' });
  }
};