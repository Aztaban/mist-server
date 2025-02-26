import PostModel, { Post } from "../models/Post";

export const getAllPosts = async (): Promise<Post[]> => {
  return await PostModel.find();
};

export const getPostById = async (postId: string): Promise<Post | null> => {
  return await PostModel.findById(postId).exec();
};

export const createPost = async (postData: Post): Promise<Post> => {
  return await PostModel.create(postData);
};

export const updatePostById = async (postId: string, updatedData: Partial<Post>): Promise<Post | null> => {
  return await PostModel.findByIdAndUpdate(postId, updatedData, { new: true }).exec();
};

export const deletePostById = async (postId: string): Promise<Post | null> => {
  return await PostModel.findByIdAndDelete(postId).exec();
};
