import express, { Router } from 'express';
import { handleNewUser } from '../controllers/auth/registerController';
import { handleRefreshToken } from '../controllers/auth/refreshTokenController';
import { handleLogout } from '../controllers/auth/logoutController';
import { handleLogin } from '../controllers/auth/authController';

const router: Router = express.Router();

router.post('/', handleLogin);
router.get('/refresh', handleRefreshToken);
router.post('/register', handleNewUser);
router.get('/logout', handleLogout);

export = router;
