import { Request, Response } from 'express';
import * as postService from '../../services/postService';

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await postService.getAllPosts();
    if (posts.length === 0) {
      res.status(204).json({ message: 'No posts found' });
      return;
    }
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await postService.getPostById(req.params.id);
    if (!post) {
      res.status(404).json({ message: `No post found with ID ${req.params.id}` });
      return;
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createNewPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const newPost = req.body;

    if (!newPost.title || !newPost.body || !newPost.date) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const createdPost = await postService.createPost(newPost);
    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const updatedData = req.body;

    if (!postId) {
      res.status(400).json({ message: 'Post ID is required' });
      return;
    }

    const updatedPost = await postService.updatePostById(postId, updatedData);
    if (!updatedPost) {
      res.status(404).json({ message: 'Post not found or failed to update' });
      return;
    }

    res.json({ message: 'Post updated successfully', updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    if (!postId) {
      res.status(400).json({ message: 'Post ID required' });
      return;
    }

    const deletedPost = await postService.deletePostById(postId);
    if (!deletedPost) {
      res.status(404).json({ message: `No post found with ID ${postId}` });
      return;
    }

    res.json({ message: 'Post deleted successfully', deletedPost });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
