import mongoose, { Schema, Document } from 'mongoose';

export interface Product extends Document {
  name: string;
  productType: string;
  price?: number;
  image: string;
  details: {
    author?: string;
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
  price: String,
  image: {
    type: String,
    required: true,
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
    description: String,
  },
});

const ProductModel = mongoose.model<Product>('Product', productSchema);

export default ProductModel;
