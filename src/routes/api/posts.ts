import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import { ROLES_LIST } from '../../config/roles_list';
import postsController from '../../controllers/postsController';
import verifyJWT from '../../middleware/verifyJWT';

const router: Router = express.Router();

router
  .route('/')
  .get(postsController.getAllPosts)
  .post(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    postsController.createNewPost
  );

router
  .route('/:id')
  .get(postsController.getPostById)
  .put(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    postsController.updatePost
  )
  .delete(verifyJWT, verifyRoles(ROLES_LIST.Admin), postsController.deletePost);

export = router;
