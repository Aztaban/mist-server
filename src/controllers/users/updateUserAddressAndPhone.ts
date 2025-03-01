import { Response } from 'express';
import { updateUserContactInfo } from '../../services/userServices';
import { AuthRequest } from '../../middleware/verifyJWT';
import { validateAddress } from '../../utils/validateAddress';

export const updateUserAddressAndPhone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized: No user ID provided' });
      return;
    }
    const { address, phoneNumber } = req.body;

    if (!address && !phoneNumber) {
      res.status(400).json({ message: 'No data provided to update' });
      return;
    }

    if (address) {
      const isValidAddress = validateAddress(address);
      if (!isValidAddress.valid) {
        res.status(400).json({ message: isValidAddress.message });
        return;
      }
    }

    // Validate Phone Number (Optional Regex for standard formats)
    if (phoneNumber && !/^\+?\d{10,15}$/.test(phoneNumber)) {
      res.status(400).json({ message: 'Invalid phone number format' });
      return;
    }

    await updateUserContactInfo(userId, address, phoneNumber);
    res.status(200).json({
      message: 'User contact information updated successfully',
    });
  } catch (error) {
    console.error('Error updating user address and phone number:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
