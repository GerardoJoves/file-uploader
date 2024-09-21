import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { matchedData, validationResult } from 'express-validator';
import passport from 'passport';

import prisma from '../lib/prisma.js';
import {
  userSignupValidation,
  UserSignupData,
} from 'src/middleware/validation.js';

const signupGet = (_req: Request, res: Response) => {
  res.render('pages/sign_up', { title: 'Sign up' });
};

const signupPost = [
  ...userSignupValidation,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('pages/sign_up', { title: 'Sign up', errors: errors.array() });
      return;
    }
    const { username, password } = matchedData<UserSignupData>(req);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { username: username, password: hashedPassword },
    });
    res.redirect('/users/log_in');
  }),
];

const loginGet = (_req: Request, res: Response) => {
  res.render('pages/log_in', { title: 'Log in' });
};

const loginPost = [
  passport.authenticate('local', { successRedirect: '/', failWithError: true }),
  (_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.render('pages/log_in', {
      title: 'Log in',
      errMsg: 'Invalid username or password',
    });
  },
];

const logoutGet = (req: Request, res: Response, next: NextFunction) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    res.redirect('/');
  });
};

export default { signupGet, signupPost, loginGet, loginPost, logoutGet };
