import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import { ROLES_LIST } from '../../config/roles_list';
import * as productsController from '../../controllers/products';
import {
  uploadImage,
  updateProductImage,
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
  .patch(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    productsController.updateProduct
  );

router
  .route('/imageUpload')
  .post(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    uploadMiddleware,
    uploadImage
  );

router
  .route('/:id/image')
  .put(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    uploadMiddleware,
    updateProductImage
  );

export = router;
