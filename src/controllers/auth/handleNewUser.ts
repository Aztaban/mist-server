import { Request, Response } from "express";
import { hashPassword } from "../../services/authServices";
import { createUser, findUserByUsername } from "../../services/userServices";

export const handleNewUser = async (req: Request, res: Response): Promise<void> => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    res.status(400).json({ message: 'Username or password are required' });
    return;
  }

  try {
    const duplicate = await findUserByUsername(user);
    if (duplicate) {
      res.sendStatus(409);
      return;
    }

    const hashedPwd = await hashPassword(pwd);
    const newUser = await createUser(user, hashedPwd);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating new user' });
  }
};