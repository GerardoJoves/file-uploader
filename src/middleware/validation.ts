import { body, param, query } from 'express-validator';
import prisma from '../lib/prisma.js';

export type UserSignupData = {
  username: string;
  password: string;
  confirmPassword: string;
};

const isUsernameAvailable = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username: username },
  });
  if (user) throw new Error('Username already in use');
};

const usernameValidationQuery = () =>
  query('username')
    .isLength({ min: 4, max: 25 })
    .withMessage('Username must be between 4 and 25 characters.')
    .custom((value: string) => {
      const regex = /^[a-zA-Z0-9_]+$/;
      return regex.test(value);
    })
    .withMessage('Username must contain only contain alphanumeric characters');

const usernameValidaton = () =>
  body('username')
    .isLength({ min: 4, max: 25 })
    .withMessage('Username must be between 4 and 25 characters.')
    .custom((value: string) => {
      const regex = /^[a-zA-Z0-9_]+$/;
      return regex.test(value);
    })
    .withMessage('Username must contain only contain alphanumeric characters');

const passwordValidation = () =>
  body('password')
    .isLength({ min: 8, max: 30 })
    .withMessage('Password must be 8 to 30 characters long')
    .matches(/^(?=.*\d)(?=.*[a-zA-Z]).+$/)
    .withMessage('Password must contain at least one number and one letter');

const userSignupValidation = [
  usernameValidaton().custom(isUsernameAvailable),
  passwordValidation(),
];

const blockNameValidation = () =>
  body('name').trim().isLength({ min: 1, max: 255 });

const blockIdValidation = () => body('id').isUUID();

const blockIdParamValidation = () => param('id').isUUID();

const searchQueryValidation = () =>
  query('q').trim().isLength({ min: 1, max: 100 });

export {
  usernameValidaton,
  passwordValidation,
  usernameValidationQuery,
  userSignupValidation,
  blockNameValidation,
  blockIdValidation,
  blockIdParamValidation,
  searchQueryValidation,
};
