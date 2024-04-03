import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import { ROLES_LIST } from '../../config/roles_list';
import postsController from '../../controllers/postsController';

const router: Router = express.Router();

router
  .route('/')
  .get(postsController.getAllPosts)
  .post(postsController.createNewPost)
  .delete(postsController.deletePost);

router
  .route('/:id')
  .get(postsController.getPostById)
  .put(postsController.updatePost);

export = router;
