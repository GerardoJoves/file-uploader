import { Router, Request, Response, NextFunction } from 'express';
import userController from '../controllers/user.js';

const router = Router();

router.get('/check-username', userController.checkUsernameGet);

router.all('/log_in', (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) res.redirect('/home');
  else next();
});

router
  .route('/log_in')
  .get(userController.loginGet)
  .post(userController.loginPost);

router.get('/log_out', userController.logoutGet);

export default router;
