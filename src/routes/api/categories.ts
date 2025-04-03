import express, { Router } from 'express';
import * as categoryController from '../../controllers/category';
import verifyRoles from '../../middleware/verifyRoles';
import { ROLES_LIST } from '../../config/roles_list';

const router: Router = express.Router();

router.route('/').get(categoryController.getCategories);
router.route('/').post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), categoryController.addCategory);
router.route('/:id').delete(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), categoryController.removeCategory);
router.route('/:id').patch(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), categoryController.updateCategory);

export = router;
