import mongoose, { Schema, Document, ObjectId } from 'mongoose';

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

const userSchema: Schema = new Schema(
  {
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
  },
  {
    timestamps: true, 
  }
);

// Create a virtual field 'id' that maps to '_id'
userSchema.virtual('id').get(function (this: Document) {
  return this._id as ObjectId
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
