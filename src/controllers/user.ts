import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { matchedData, validationResult } from 'express-validator';

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
    res.redirect('/');
  }),
];

export default { signupGet, signupPost };
