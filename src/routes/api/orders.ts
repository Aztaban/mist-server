import express, { Router } from 'express';
import verifyRoles from '../../middleware/verifyRoles';

const router: Router = express.Router();

router
  .route('/') 
  .get()  // Get all Orders
  .post(); // Create a new Order 

router
  .route('/:id')
  .get()  // Get Order by ID
  .put() // Update Order
  .delete() // Delete Order

router.route('/:id/status').put() // Update Order Status
router.route('/:id/pay').put() // Mark Order as Paid
router.route('/:status').get() // Get Orders by Status

export = router;
