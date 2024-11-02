import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  if (req.isAuthenticated()) res.redirect('/home');
  else res.redirect('/users/log_in');
});

export default router;
