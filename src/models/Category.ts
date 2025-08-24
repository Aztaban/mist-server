import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 64,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.virtual('id').get(function (this: ICategory) {
  return (this._id as mongoose.Types.ObjectId).toString();
});

categorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id; // keep only "id"
  },
});
categorySchema.set('toObject', { virtuals: true, versionKey: false });
const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
