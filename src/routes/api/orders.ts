import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import * as ordersController from '../../controllers/orders';
import { createPaymentIntent } from '../../controllers/payment/paymentController';
import { ROLES_LIST } from '../../config/roles_list';

const router: Router = express.Router();

router
  .route('/')
  .get(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    ordersController.getAllOrders
  )
  .post(ordersController.createNewOrder);

router
  .route('/user')
  .get(verifyRoles(ROLES_LIST.User), ordersController.getOrdersForUser); // get orders for user who requested it

router
  .route('/:id')
  .get(
    verifyRoles(ROLES_LIST.User, ROLES_LIST.Editor, ROLES_LIST.Admin),
    ordersController.getOrderById
  )
  .put(
    verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
    ordersController.updateOrder
  )
  .delete(verifyRoles(ROLES_LIST.Admin), ordersController.deleteOrder);

router.route('/:id/mark-paid').put(ordersController.updateOrderPaid);
router.route('/:id/payment-intent').post(createPaymentIntent);

export = router;
