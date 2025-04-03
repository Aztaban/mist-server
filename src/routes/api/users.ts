import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import * as userController from '../../controllers/users';
import { getOrdersForUser } from '../../controllers/orders';
import { ROLES_LIST } from '../../config/roles_list';
import { updatePassword } from '../../controllers/auth';

const router: Router = express.Router();

router.route('/').get(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),userController.getAllUsers);
router.route('/user').get(userController.getUser);
router.route('/user/orders').get(verifyRoles(ROLES_LIST.User),getOrdersForUser);
router.route('/user/address').patch(verifyRoles(ROLES_LIST.User),userController.updateAddress);
router.route('/user/phone').patch(verifyRoles(ROLES_LIST.User),userController.updatePhone);
router.route('/user/email').patch(verifyRoles(ROLES_LIST.User),userController.updateEmail);
router.route('/user/password').put(verifyRoles(ROLES_LIST.User),updatePassword);

router.route('/:id').get(verifyRoles(ROLES_LIST.Admin), userController.getUserById);

router.route('/:id/toggle-status').patch(verifyRoles(ROLES_LIST.Admin), userController.toggleUserStatus);
router.route('/:id/toggle-editor').patch(verifyRoles(ROLES_LIST.Admin), userController.toggleEditorRole);

export = router;
