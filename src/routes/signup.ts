import { Router } from 'express';
import userController from '../controllers/user.js';

const router = Router();

router.route('/').get(userController.signupGet).post(userController.signupPost);

export default router;
