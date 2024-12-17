import mongoose, { Schema, Document, ObjectId } from 'mongoose';

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

postSchema.virtual('id').get(function (this: Document) {
  return this._id as ObjectId;
});

// Set toJSON options to include virtuals and remove _id and __v
postSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // Remove __v field
  transform: (doc, ret) => {
    delete ret._id; // Remove _id from the JSON output
  },
});

const PostModel = mongoose.model<Post>('Post', postSchema)

export default PostModel;