import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';
import ordersController from '../../controllers/ordersController';

const router: Router = express.Router();

router
  .route('/') 
  .get(ordersController.getAllOrders)  // Get all Orders
  .post(ordersController.createNewOrder); // Create a new Order 

router
  .route('/:id')
  .get(ordersController.getOrderById)  // Get Order by ID
  .put() // Update Order
  .delete() // Delete Order

router.route('/:id/status').put() // Update Order Status
router.route('/:id/pay').put() // Mark Order as Paid
router.route('/:status').get() // Get Orders by Status

export = router;
