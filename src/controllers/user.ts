import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { matchedData, validationResult } from 'express-validator';
import passport from 'passport';

import prisma from '../lib/prisma.js';
import {
  userSignupValidation,
  UserSignupData,
  usernameValidationQuery,
  usernameValidaton,
  passwordValidation,
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
      data: {
        username: username,
        password: hashedPassword,
        blocks: {
          create: [{ name: 'Home', type: 'ROOT' }],
        },
      },
    });
    res.redirect('/users/log_in');
  }),
];

const loginGet = (_req: Request, res: Response) => {
  res.render('pages/log_in', { title: 'Log in' });
};

const loginPost = [
  usernameValidaton(),
  passwordValidation(),
  (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) next();
    else next(errors);
  },
  passport.authenticate('local', { successRedirect: '/', failWithError: true }),
  (_err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.render('pages/log_in', {
      title: 'Log in',
      errMsg: 'Incorrect username or password',
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

const checkUsernameGet = [
  usernameValidationQuery(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const { username } = matchedData<{ username: string }>(req);
    if (!errors.isEmpty) {
      res.status(400).json({ error: 'Invalid username' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    if (user) {
      res.status(200).json({ available: false });
    } else {
      res.status(200).json({ available: true });
    }
  }),
];

export default {
  signupGet,
  signupPost,
  loginGet,
  loginPost,
  logoutGet,
  checkUsernameGet,
};
