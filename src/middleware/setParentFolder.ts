import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { validationResult, matchedData } from 'express-validator';

import prisma from '../lib/prisma.js';
import { blockIdParamValidation } from './validation.js';

const setParentFolderById = [
  blockIdParamValidation(),
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const { id } = matchedData<{ id: string }>(req, { locations: ['params'] });
    const user = req.user as Express.User;
    const folder = await prisma.block.findUnique({
      where: {
        id: id,
        ownerId: user.id,
        type: 'FOLDER',
        deletionTime: null,
      },
    });
    if (!folder) throw new Error('404');
    req.parentFolder = folder;
    next();
  }),
];

const setParentFolderUserRoot = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as Express.User;
    const folder = await prisma.block.findFirst({
      where: { type: 'ROOT', ownerId: user.id },
    });
    if (!folder) throw new Error('404');
    req.parentFolder = folder;
    next();
  },
);

export { setParentFolderById, setParentFolderUserRoot };
