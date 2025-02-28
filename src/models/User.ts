import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { ROLES_LIST } from '../config/roles_list';

export interface Address {
  name: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export const AddressSchema = new Schema<Address>({
  name: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

export interface User extends Document {
  username: string;
  email: string;
  roles: number[];
  password: string;
  address?: Address;
  phoneNumber?: string;
  refreshToken?: string;
  isActive: boolean;
}

const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    roles: {
      type: [Number],
      default: [ROLES_LIST.User],
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: AddressSchema,
      default: null,
    },
    phoneNumber: String,
    refreshToken: String,
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

// Create a virtual field 'id' that maps to '_id'
userSchema.virtual('id').get(function (this: Document) {
  return this._id as ObjectId;
});

// Set toJSON options to include virtuals and remove _id and __v
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // Remove __v field
  transform: (doc, ret) => {
    delete ret._id; // Remove _id from the JSON output
  },
});

const UserModel = mongoose.model<User>('User', userSchema);

export default UserModel;
