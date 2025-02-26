import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from './verifyJWT';

const verifyRoles = (...allowedRoles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.roles) {
      return res.status(401).json({ message: 'Unauthorized: No roles found.' });
    }

    const result: boolean = req.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!result) {
      return res
        .status(403)
        .json({ message: 'Forbidden: You do not have the required role(s).' });
    }

    next();
  };
};

export default verifyRoles;
