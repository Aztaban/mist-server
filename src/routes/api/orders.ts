import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import ordersController from '../../controllers/ordersController';

const router: Router = express.Router();

router
  .route('/')
  .get(ordersController.getAllOrders) // Get all Orders
  .post(ordersController.createNewOrder); // Create a new Order

router.route('/user').get(ordersController.getOrdersForUser); // get orders for user who requested it

router
  .route('/:id')
  .get(ordersController.getOrderById) // Get Order by ID
  .put(ordersController.updateOrder) // Update Order
  .delete(ordersController.deleteOrder); // Delete Order

router.route('/:id/status').put(ordersController.updateOrderStatus); // Update Order Status
router.route('/:id/pay').put(ordersController.updateOrderPaid); // Mark Order as Paid

export = router;
