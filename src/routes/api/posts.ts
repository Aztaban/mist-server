import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import { ROLES_LIST } from '../../config/roles_list';
import postsController from '../../controllers/postsController';

const router: Router = express.Router();

router
  .route('/')
  .get(postsController.getAllPosts)
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    postsController.createNewPost
  )
  .delete(verifyRoles(ROLES_LIST.Admin), postsController.deletePost);

router
  .route('/:id')
  .get(postsController.getPostById)
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    postsController.updatePost
  );

export = router;
