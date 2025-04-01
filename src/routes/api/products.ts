import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import { ROLES_LIST } from '../../config/roles_list';
import * as productsController from '../../controllers/products';
import {
  handleImageUpload,
  handleProductImageUpdate,
} from '../../controllers/upload/uploadController';
import verifyJWT from '../../middleware/verifyJWT';
import { singleFileUpload } from '../../utils/upload';

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
    singleFileUpload,
    handleImageUpload
  );

router
  .route('/:id/image')
  .put(
    verifyJWT,
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    singleFileUpload,
    handleProductImageUpdate
  );

export = router;
