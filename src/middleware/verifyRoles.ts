import { Response, NextFunction } from "express"
import { AuthRequest } from "./verifyJWT"

const verifyRoles = (...allowedRoles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req?.roles) {
      res.sendStatus(401);
      return;
    }
    const rolesArray: number[] = [...allowedRoles];
    const result: boolean = req.roles.some(role => rolesArray.includes(role));
    if (!result ) {
      res.sendStatus(403); // Forbidden if the user doesn't have the required roles
      return;
    }

    next();
  }
}

export default verifyRoles;