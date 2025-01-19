import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import { ROLES_LIST } from '../../config/roles_list';
import productsController from '../../controllers/productsController';
import {
  uploadFile,
  uploadMiddleware,
} from '../../controllers/uploadController';
import verifyJWT from '../../middleware/verifyJWT';

const router: Router = express.Router();

router
  .route('/')
  .get(productsController.getAllProducts)
  .post(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.createNewProduct
  )
  .delete(verifyRoles(ROLES_LIST.Admin), productsController.deleteProduct);

router
  .route('/:id')
  .get(productsController.getProduct)
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.updateProduct
  );

router
  .route('/imageUpload')
  .post(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    uploadMiddleware,
    uploadFile
  );

export = router;
