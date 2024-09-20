import { Router } from 'express';
import userController from '../controllers/user.js';

const router = Router();

router
  .route('/sign_up')
  .get(userController.signupGet)
  .post(userController.signupPost);

export default router;
