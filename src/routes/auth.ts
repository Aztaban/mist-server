import express, { Router } from 'express';

const router: Router = express.Router();

router.post('/');
router.get('/refresh');
router.post('/register');
router.get('/logout');

export default router;
