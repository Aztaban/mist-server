import express, { Router } from 'express';
import * as authController from '../controllers/auth';
import loginLimiter from '../middleware/loginLimiter';

const router: Router = express.Router();

router.route('/login').post(loginLimiter, authController.handleLogin);
router.route('/refresh').get(authController.handleRefreshToken);
router.route('/register').post(authController.handleNewUser);
router.route('/logout').post(authController.handleLogout);

export = router;
