import { Address } from '../models/User';

export const validateAddress = (address: Partial<Address>): { valid: boolean; message?: string } => {
  const { name, street, city, postalCode, country } = address;

  if (!name || !street || !city || !postalCode || !country) {
    return { valid: false, message: 'Invalid address format. Missing required fields.' };
  }

  if (typeof postalCode !== 'string' || postalCode.length < 4 || postalCode.length > 10) {
    return { valid: false, message: 'Invalid postal code format.' };
  }

  return { valid: true };
};