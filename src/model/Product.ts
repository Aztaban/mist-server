import mongoose, { Schema, Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  productType: string;
  price: number;
  image: string;
  countInStock: number;
  details: {
    author: string;
    releaseDate: string;
    description: string;
  };
}

const productSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  countInStock: {
    type: Number,
    default: 0,
  },
  details: {
    author: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: String,
      default: 'TBD Soon',
    },
    description: {
      type: String,
    },
  },
});

// Create a virtual field 'id' that maps to '_id'
productSchema.virtual('id').get(function (this: Document) {
  return this._id.toHexString();
});

// Set toJSON options to include virtuals and remove _id and __v
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // Remove __v field
  transform: (doc, ret) => {
    delete ret._id; // Remove _id from the JSON output
  },
});

const ProductModel = mongoose.model<Product>('Product', productSchema);

export default ProductModel;
