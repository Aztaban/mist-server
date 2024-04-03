import mongoose, { Schema, Document } from 'mongoose';

export interface Post extends Document {
  title: string;
  body: string;
  date: string;
}

const postSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
})

const PostModel = mongoose.model<Post>('Post', postSchema)

export default PostModel;