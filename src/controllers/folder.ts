import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';
import { Prisma } from '@prisma/client';

import prisma from '../lib/prisma.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import hasFolderWriteAccess from 'src/middleware/hasFolderWriteAccess.js';
import { folderNameValidation } from '../middleware/validation.js';

const folderGet = [
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const id = req.params.id ? parseInt(req.params.id) : null;
    if (id != null && isNaN(id)) throw new Error('400');
    const where: Prisma.BlockWhereInput =
      id == null
        ? { type: 'ROOT', ownerId: user.id }
        : { type: 'FOLDER', id: id, ownerId: user.id };
    const include: Prisma.BlockInclude = {
      children: { orderBy: { type: 'desc' } },
      parentFolder: true,
    };
    const folder = await prisma.block.findFirst({ where, include });
    if (!folder) throw new Error('404');
    res.render('pages/folder', { title: folder.name, folder });
  }),
];

const createFolderGet = [
  isAuthenticated,
  (_req: Request, res: Response) => {
    res.render('pages/create_folder_form', { title: 'Create Folder' });
  },
];

const createFolderPost = [
  isAuthenticated,
  folderNameValidation(),
  hasFolderWriteAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const locals = { title: 'Create Folder', errors: errors.array() };
      res.render('pages/create_folder_form', locals);
      return;
    }
    const user = req.user as Express.User;
    const { folderName } = matchedData<{ folderName: string }>(req);
    let parentFolderId = req.params.id ? parseInt(req.params.id) : null;
    if (parentFolderId == null) {
      const root = await prisma.block.findFirst({
        where: { type: 'ROOT', ownerId: user.id },
      });
      if (!root) throw new Error('404');
      parentFolderId = root.id;
    } else if (isNaN(parentFolderId)) {
      throw new Error('400');
    }
    await prisma.block.create({
      data: {
        name: folderName,
        type: 'FOLDER',
        ownerId: user.id,
        parentFolderId,
      },
    });
    res.redirect(req.params.id ? `/folders/${parentFolderId}` : '/home');
  }),
];

export default {
  folderGet,
  createFolderGet,
  createFolderPost,
};
