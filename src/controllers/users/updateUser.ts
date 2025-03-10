import { Response } from 'express';
import {
  updateUserContactInfo,
  updateUserEmail,
  findUserByEmail
} from '../../services/userServices';
import { AuthRequest } from '../../middleware/verifyJWT';
import { validateAddress } from '../../utils/validateAddress';

// Update User Address
export const updateAddress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID provided' });
      return;
    }
    const { address } = req.body;

    if (!address) {
      res.status(400).json({ message: 'No address provided to update' });
      return;
    }

    const isValidAddress = validateAddress(address);
    if (!isValidAddress.valid) {
      res.status(400).json({ message: isValidAddress.message });
      return;
    }

    await updateUserContactInfo(userId, address);
    res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Error updating user address:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updatePhone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID provided' });
      return;
    }
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      res.status(400).json({ message: 'No phone number provided to update' });
      return;
    }
    if (!/^\+?\d{10,15}$/.test(phoneNumber)) {
      res.status(400).json({ message: 'Invalid phone number format' });
      return;
    }

    await updateUserContactInfo(userId, phoneNumber);
    res.status(200).json({ message: 'Phone number updated successfully' });
  } catch (error) {
    console.error('Error updating user phone number:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateEmail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID provided' });
      return;
    }
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'No email provided to update' });
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.id.toString() !== userId) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }
    await updateUserEmail(userId, email);
    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating user email:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
