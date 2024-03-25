import mongoose, { Schema, Document } from 'mongoose';

export interface User extends Document {
  username: string;
  roles: {
    User: number;
    Editor?: number;
    Admin?: number;
  };
  password: string;
  refreshToken?: string;
}

const userSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
  },
  roles: {
    User: {
      type: Number,
      default: 1012,
    },
    Editor: Number,
    Admin: Number,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: String,
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
