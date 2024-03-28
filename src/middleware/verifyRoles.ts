import { Response, NextFunction } from "express"
import { AuthRequest } from "./verifyJWT"

const verifyRoles = (...allowedRoles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req?.roles) {
      res.sendStatus(401);
      return;
    }
    const rolesArray: number[] = [...allowedRoles];
    const result = req.roles.map((role: number) => rolesArray.includes(role)).find((val: boolean) => val === true);
    if (!result ) {
      res.sendStatus(401);
      next();
    }
  }
}

export default verifyRoles;