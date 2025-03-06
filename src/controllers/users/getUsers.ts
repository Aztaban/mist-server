import { Response } from "express";
import { AuthRequest } from "../../middleware/verifyJWT";
import { findUserById, findAllUsers } from "../../services/userServices";

export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user;
  
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized: No user ID provided' });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await findAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
};