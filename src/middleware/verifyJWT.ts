import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import UserModel from '../models/User';

export interface AuthRequest extends Request {
  user?: Types.ObjectId;
  roles?: number[];
}

const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  const token: string = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret, async (err:any, decoded: any) => {
    if (err) {
      res.sendStatus(403); //invalid token
      return;
    }
    try {
      // Look up the user by username (or include userId in your token payload if possible)
      const user = await UserModel.findOne({
        username: decoded.UserInfo.username,
      }).select('_id roles');
      if (!user) {
        return res.sendStatus(404).json({ message: 'User not found' });
      }
      // Attach the user ObjectId and roles to the request
      req.user = user.id;
      req.roles = user.roles;
      next();
    } catch (error) {
      console.error('Error verifying user from DB:', error);
      res.sendStatus(500);
    }
  })
}

export default verifyJWT;

