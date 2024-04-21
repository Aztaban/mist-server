import express, { Router } from 'express';
import { handleNewUser } from '../controllers/auth/registerController';
import { handleRefreshToken } from '../controllers/auth/refreshTokenController';
import { handleLogout } from '../controllers/auth/logoutController';
import { handleLogin } from '../controllers/auth/authController';
import loginLimiter from '../middleware/loginLimiter';

const router: Router = express.Router();

router.route('/').post(loginLimiter, handleLogin);
router.route('/refresh').get(handleRefreshToken);
router.route('/register').post(handleNewUser);
router.route('/logout').post(handleLogout);

export = router;
