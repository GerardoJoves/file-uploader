import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';

import prisma from '../lib/prisma.js';
import checkAuth from '../middleware/checkAuth.js';
import checkFolderWriteAccess from 'src/middleware/checkFolderWriteAccess.js';
import {
  folderNameValidation,
  folderParamIdValidation,
} from '../middleware/validation.js';

async function createFolder(
  name: string,
  user: Express.User,
  parentId: number,
) {
  return await prisma.block.create({
    data: {
      name: name,
      type: 'FOLDER',
      ownerId: user.id,
      parentFolderId: parentId,
    },
  });
}

function checkFolderValidationResult(type: 'ROOT' | 'FOLDER') {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (type === 'FOLDER') {
      const data = matchedData(req);
      if (!data.id) throw new Error('400');
    }
    if (!errors.isEmpty()) {
      const locals = { title: 'Create Folder', errors: errors.array() };
      res.render('pages/create_folder_form', locals);
      return;
    }
    next();
  };
}

const folderGet = [
  checkAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new Error('400');
    const folder = await prisma.block.findUnique({
      where: { id: id, ownerId: user.id, type: 'FOLDER' },
      include: { children: { orderBy: { type: 'desc' } }, parentFolder: true },
    });
    if (!folder) throw new Error('404');
    res.render('pages/folder', { title: folder.name, folder });
  }),
];

const rootFolderGet = [
  checkAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const root = await prisma.block.findFirst({
      where: { ownerId: user.id, type: 'ROOT' },
      include: { children: { orderBy: { type: 'desc' } } },
    });
    res.render('pages/home', { title: 'Home', folder: root, user });
  }),
];

const createChildFolderGet = [
  checkAuth,
  (_req: Request, res: Response) => {
    res.render('pages/create_folder_form', { title: 'Create Folder' });
  },
];

const createChildFolderPost = [
  checkAuth,
  checkFolderWriteAccess,
  folderNameValidation(),
  folderParamIdValidation(),
  checkFolderValidationResult('FOLDER'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const { id: parentFolderId, folderName } = matchedData<{
      id: number;
      folderName: string;
    }>(req);
    await createFolder(folderName, user, parentFolderId);
    res.redirect('/folders/' + parentFolderId);
  }),
];

const createRootChildFolderPost = [
  checkAuth,
  folderNameValidation(),
  checkFolderValidationResult('ROOT'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const { folderName } = matchedData<{ folderName: string }>(req);
    const root = await prisma.block.findFirst({
      where: { type: 'ROOT', ownerId: user.id },
    });
    if (!root) throw new Error('404');
    await createFolder(folderName, user, root.id);
    res.redirect('/home');
  }),
];

export default {
  rootFolderGet,
  folderGet,
  createChildFolderGet,
  createChildFolderPost,
  createRootChildFolderPost,
};
