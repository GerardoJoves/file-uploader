import { body } from 'express-validator';
import prisma from '../lib/prisma.js';

export type UserSignupData = {
  username: string;
  password: string;
  passwordConfirmation: string;
};

const isUsernameAvailable = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username: username },
  });
  if (user) throw new Error('Username already in use');
};

const usernameValidaton = () =>
  body('username')
    .trim()
    .isLength({ min: 4, max: 25 })
    .withMessage('Username must be 4 to 25 characters long')
    .isAlphanumeric()
    .withMessage('Username must contain only letters, numbers, or underscores');

const passwordValidation = () =>
  body('password')
    .isLength({ min: 8, max: 30 })
    .withMessage('Password must be 8 to 30 characters long')
    .matches(/^(?=.*\d)(?=.*[a-zA-Z]).+$/)
    .withMessage('Password must contain at least one number and one letter');

const userSignupValidation = [
  usernameValidaton().custom(isUsernameAvailable),
  passwordValidation(),
  body('passwordConfirmation')
    .custom((value, { req }) => {
      const { password } = req.body as UserSignupData;
      return value === password;
    })
    .withMessage('Incorrect password confirmation'),
];

const folderNameValidation = () =>
  body('folderName').trim().exists().isLength({ max: 255 });

export { userSignupValidation, folderNameValidation };
