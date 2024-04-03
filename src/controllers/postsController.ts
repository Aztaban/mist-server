import PostModel, { Post} from '../model/Post';
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

const postsController = {
  getAllPosts,
  createNewPost
}

export default postsController;