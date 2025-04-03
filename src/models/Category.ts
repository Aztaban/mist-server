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
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.virtual('id').get(function (this: Document) {
  return this._id as ObjectId;
});

const Category: Model<ICategory> = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
