import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import ordersController from '../../controllers/ordersController';
import { ROLES_LIST } from '../../config/roles_list';

const router: Router = express.Router();

router
  .route('/')
  .get(verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),ordersController.getAllOrders) // Get all Orders
  .post(ordersController.createNewOrder); // Create a new Order

router.route('/user').get(verifyRoles(ROLES_LIST.User),ordersController.getOrdersForUser); // get orders for user who requested it

router
  .route('/:id')
  .get(ordersController.getOrderById) // Get Order by ID
  .put(verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),ordersController.updateOrder) // Update Order
  .delete(verifyRoles(ROLES_LIST.Admin),ordersController.deleteOrder); // Delete Order

router.route('/:id/status').put(verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),ordersController.updateOrderStatus); // Update Order Status
router.route('/:id/pay').put(ordersController.updateOrderPaid); // Mark Order as Paid

export = router;
