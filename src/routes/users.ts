import { Router } from 'express';
import userController from '../controllers/user.js';

const router = Router();

router
  .route('/sign_up')
  .get(userController.signupGet)
  .post(userController.signupPost);

router
  .route('/log_in')
  .get(userController.loginGet)
  .post(userController.loginPost);

router.get('/log_out', userController.logoutGet);

export default router;
