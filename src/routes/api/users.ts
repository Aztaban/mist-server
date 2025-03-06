import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import * as userController from '../../controllers/users';
import { ROLES_LIST } from '../../config/roles_list';

const router: Router = express.Router();

router.route('/').get(userController.getUser);

router.route('/address').put(userController.updateUserAddressAndPhone);
router
  .route('/admin')
  .get(verifyRoles(ROLES_LIST.Admin), userController.getAllUsers);
router.route('/:id').patch(verifyRoles(ROLES_LIST.Admin), userController.toggleUserStatus);

 
export = router;
