import PostModel, { Post } from '../models/Post';

/**
 * Fetch all posts.
 * @returns Array of posts (may be empty).
 */
export const getAllPosts = async (): Promise<Post[]> => {
  return await PostModel.find().exec();
};

/**
 * Fetch a single post by id.
 * @param postId - Post ObjectId as string.
 * @returns The post or `null` if not found.
 */
export const getPostById = async (postId: string): Promise<Post | null> => {
  return await PostModel.findById(postId).exec();
};

/**
 * Create a new post.
 * @param postData - Full post payload.
 * @returns The created post document.
 */
export const createPost = async (postData: Post): Promise<Post> => {
  return await PostModel.create(postData);
};

/**
 * Update a post by id.
 * @param postId - Post id.
 * @param updatedData - Fields to update.
 * @returns Updated post or `null` if not found.
 */
export const updatePostById = async (postId: string, updatedData: Partial<Post>): Promise<Post | null> => {
  return await PostModel.findByIdAndUpdate(postId, updatedData, { new: true }).exec();
};

/**
 * Delete a post by id.
 * @param postId - Post id.
 * @returns Deleted post or `null` if not found.
 */
export const deletePostById = async (postId: string): Promise<Post | null> => {
  return await PostModel.findByIdAndDelete(postId).exec();
};
