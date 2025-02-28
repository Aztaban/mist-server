import express, { Router } from 'express';
import * as authController from '../controllers/auth';
import * as userController from '../controllers/users';
import loginLimiter from '../middleware/loginLimiter';

const router: Router = express.Router();

router.route('/login').post(loginLimiter, authController.handleLogin);
router.route('/refresh').get(authController.handleRefreshToken);
router.route('/register').post(userController.handleNewUser);
router.route('/logout').post(authController.handleLogout);

export = router;
