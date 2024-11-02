import { Router, Request, Response, NextFunction } from 'express';
import userController from '../controllers/user.js';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) res.redirect('/home');
  else next();
});

router.route('/').get(userController.signupGet).post(userController.signupPost);

export default router;
