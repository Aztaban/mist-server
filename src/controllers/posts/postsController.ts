import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import * as postService from '../../services/postService';

/**
 * List all posts.
 *
 * Route: GET /posts
 *
 * Responses:
 * - 200 OK: array of posts (may be empty [])
 * - 5xx: delegated to global error handler
 */
export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await postService.getAllPosts();
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single post by id.
 *
 * Route: GET /posts/:id
 *
 * Responses:
 * - 200 OK: the post
 * - 400 Bad Request: missing/invalid id
 * - 404 Not Found: post not found
 * - 5xx: delegated to global error handler
 */
export const getPostById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid post id');
      (err as any).status = 400;
      throw err;
    }

    const post = await postService.getPostById(id);
    if (!post) {
      const err = new Error(`No post found with ID ${id}`);
      (err as any).status = 404;
      throw err;
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new post.
 *
 * Route: POST /posts
 *
 * Request body:
 * - `title`: string (required)
 * - `body`:  string (required)
 * - `date`:  string/Date (required)
 *
 * Responses:
 * - 201 Created: created post
 * - 400 Bad Request: missing required fields
 * - 5xx: delegated to global error handler
 */
export const createNewPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newPost = req.body as { title?: string; body?: string; date?: unknown };

    if (!newPost.title || !newPost.body || !newPost.date) {
      const err = new Error('Please provide all required fields');
      (err as any).status = 400;
      throw err;
    }

    const createdPost = await postService.createPost(newPost as any);
    res.status(201).json(createdPost);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a post by id.
 *
 * Route: PATCH /posts/:id
 *
 * Responses:
 * - 200 OK: `{ message, updatedPost }`
 * - 400 Bad Request: missing/invalid id
 * - 404 Not Found: post not found
 * - 5xx: delegated to global error handler
 */
export const updatePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid post id');
      (err as any).status = 400;
      throw err;
    }

    const updatedPost = await postService.updatePostById(id, req.body);
    if (!updatedPost) {
      const err = new Error('Post not found or failed to update');
      (err as any).status = 404;
      throw err;
    }

    res.json({ message: 'Post updated successfully', updatedPost });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a post by id.
 *
 * Route: DELETE /posts/:id
 *
 * Responses:
 * - 200 OK: `{ message, deletedPost }`
 * - 400 Bad Request: missing/invalid id
 * - 404 Not Found: id not found
 * - 5xx: delegated to global error handler
 *
 * @remarks Many APIs return 204 No Content for deletes; returning 200 with a body is fine if your client expects it.
 */
export const deletePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid post id');
      (err as any).status = 400;
      throw err;
    }

    const deletedPost = await postService.deletePostById(id);
    if (!deletedPost) {
      const err = new Error(`No post found with ID ${id}`);
      (err as any).status = 404;
      throw err;
    }

    res.json({ message: 'Post deleted successfully', deletedPost });
  } catch (error) {
    next(error);
  }
};

const postsController = {
  getAllPosts,
  createNewPost,
  updatePost,
  getPostById,
  deletePost,
};

export default postsController;
