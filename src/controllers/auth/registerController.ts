import UserModel, { User } from '../../model/User';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

const handleNewUser = async (req: Request, res: Response): Promise<void> => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    res.status(400).json({ message: 'Username or password are required' });
    return;
  }

  // check for duplicate usernames in the db
  const duplicate: User | null = await UserModel.findOne({
    username: user,
  }).exec();
  if (duplicate) {
    res.sendStatus(409); //Conflict
    return;
  }

  try {
    //encrypt pwd
    const hashedPwd = await bcrypt.hash(pwd, 10);
    // create and store the new user
    const result: User = await UserModel.create({
      username: user,
      password: hashedPwd,
    });

    console.log(result);

    res.status(201).json({ success: `New user ${user} created!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'err.message' });
  }
};

export { handleNewUser };
