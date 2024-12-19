import PostModel, { Post} from '../models/Post';
import { Request, Response } from 'express';

interface PostRequest extends Request {
  body: Post;
}

// @desc Get all posts
// @route GET /posts
// @access Public
const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  const posts: Post[] = await PostModel.find();
  if (posts.length === 0) {
    res.status(204).json({ message: 'No products found' });
  } else {
    res.json(posts);
  }
};

// @desc Create new post
// @route POST /posts
// @access Private
const createNewPost = async (
  req: PostRequest,
  res: Response
): Promise<void> => {
  try {
    const newPost: Post = req.body;

    if (
      !newPost.title||
      !newPost.body ||
      !newPost.date 
    ) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    const createdPost: Post = await PostModel.create(newPost);
    res.status(201).json(createdPost);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc Update post
// @route PATCH /posts/:id
// @access Private
const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId: string = req.params.id;
    const updatedPostData: Post = req.body;
    console.log(updatePost)

    // Check if the post ID is provided
    if (!postId) {
      res.status(400).json({ message: 'Post ID is required' });
      return;
    }

    // Check if the post with the given ID exists
    const existingPost: Post | null = await PostModel.findById(
      postId
    ).exec();
    if (!existingPost) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Update post
    const updatedPost: Post | null = await PostModel.findByIdAndUpdate(
      postId,
      updatedPostData
    ).exec();
    console.log(updatedPost);

    // Check if the post was updated successfully
    if (!updatedPost) {
      res.status(500).json({ message: 'Failed to update post' });
      return;
    } else {
      res.json({ message: 'Post updated successfully', updatedPost });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// @desc Delete post
// @route DELETE /posts
// @access Private
const deletePost = async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id;
  console.log(postId)
  if (!postId) {
    res.status(400).json({ message: `Product ID required` });
    return;
  }
  const deletedPost: Post | null = await PostModel.findByIdAndDelete(
    postId
  ).exec();
  if (!deletedPost) {
    res.status(404).json({ message: `No post found with ID ${postId}` });
    return;
  } else {
    res.json({ message: 'Post deleted successfully', deletedPost });
  }
};

// @desc Get post by ID
// @route get /posts/:id
// @access Public
const getPostById = async (req: Request, res: Response): Promise<void> => {
  const postId = req.params.id;
  if (!postId) {
    res.status(400).json({ message: `Post ID required` });
    return;
  }
  const post: Post | null = await PostModel.findById(postId).exec();
  if (!post) {
    res.status(400).json({ message: `No Post matches ID${postId}` });
    return;
  } else {
    res.json(post);
  }
};

const postsController = {
  getAllPosts,
  createNewPost,
  updatePost,
  getPostById,
  deletePost
}

export default postsController;