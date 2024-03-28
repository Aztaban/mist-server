import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: string;
  roles?: number[];
}

const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.sendStatus(401);
    return;
  }

  const token: string = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret, (err:any, decoded: any) => {
    if (err) {
      res.sendStatus(403); //invalid token
      return;
    }
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    next();
  })
}

export default verifyJWT;