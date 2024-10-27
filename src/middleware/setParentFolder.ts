import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import prisma from '../lib/prisma.js';

const setParentFolderById = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as Express.User;
    const folder = await prisma.block.findUnique({
      where: {
        id: req.params.id,
        ownerId: user.id,
        type: 'FOLDER',
        deletionTime: null,
      },
    });
    if (!folder) throw new Error('404');
    req.parentFolder = folder;
    next();
  },
);

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
