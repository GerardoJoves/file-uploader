import { NextFunction, Request, Response } from 'express';

export default function (req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/');
}
