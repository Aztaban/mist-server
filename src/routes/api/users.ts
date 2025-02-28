import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import * as userController from '../../controllers/users';
import { ROLES_LIST } from '../../config/roles_list';

const router: Router = express.Router();

router
  .route('/')
  .get();

router.route('/address').put(userController.updateUserAddressAndPhone);

export = router;
