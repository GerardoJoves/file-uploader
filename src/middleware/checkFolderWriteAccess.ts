import { NextFunction, Request, Response } from 'express';
import asyncHandle from 'express-async-handler';

import prisma from '../lib/prisma.js';

const checkFolderWriteAccess = asyncHandle(
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user as Express.User;
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new Error('400');
    const folder = await prisma.block.findUnique({ where: { id: id } });
    if (!folder) throw new Error('404');
    if (folder.ownerId !== user.id) throw new Error('401');
    next();
  },
);

export default checkFolderWriteAccess;
