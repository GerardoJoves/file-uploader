import fs from 'node:fs/promises';

import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';
import { Prisma } from '@prisma/client';
import { getRecursiveFilePaths } from '@prisma/client/sql';

import prisma from '../lib/prisma.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import hasFolderWriteAccess from 'src/middleware/hasFolderWriteAccess.js';
import { folderNameValidation } from '../middleware/validation.js';

const handleFolderValidationErrors =
  (title: string) => (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.locals.title = title;
      res.locals.errors = errors.array();
      res.render('pages/create_folder_form');
    } else {
      next();
    }
  };

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
  handleFolderValidationErrors('Create Folder'),
  hasFolderWriteAccess,
  asyncHandler(async (req: Request, res: Response) => {
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

const updateFolderGet = [
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const folderId = parseInt(req.params.id);
    if (isNaN(folderId)) throw new Error('400');
    const folder = await prisma.block.findUnique({
      where: { id: folderId, type: 'FOLDER', ownerId: user.id },
    });
    res.render('pages/create_folder_form', { title: 'Update Folder', folder });
  }),
];

const updateFolderPost = [
  isAuthenticated,
  folderNameValidation(),
  handleFolderValidationErrors('Update Folder'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const folderId = parseInt(req.params.id);
    const { folderName } = matchedData<{ folderName: string }>(req);
    if (isNaN(folderId)) throw new Error('400');
    const updatedFolder = await prisma.block.update({
      where: { id: folderId, ownerId: user.id, type: 'FOLDER' },
      data: { name: folderName },
      include: { parentFolder: true },
    });
    res.redirect(updatedFolder ? `/folders/${updatedFolder.id}` : '/home');
  }),
];

const deleteFolderGet = [
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const folderId = parseInt(req.params.id);
    if (isNaN(folderId)) throw new Error('400');
    const folder = await prisma.block.findUnique({
      where: { id: folderId, type: 'FOLDER', ownerId: user.id },
    });
    res.render('pages/delete_folder_confirm', {
      title: 'Update Folder',
      folder,
    });
  }),
];

const deleteFolderPost = [
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const folderId = parseInt(req.params.id);
    if (isNaN(folderId)) throw new Error('400');
    const folder = await prisma.block.findUnique({
      where: { id: folderId, type: 'FOLDER' },
      include: { parentFolder: true },
    });
    if (!folder) return res.redirect('/home');
    if (folder.ownerId != user.id) throw new Error('401');
    const descendantFiles = await prisma.$queryRawTyped(
      getRecursiveFilePaths(folder.id),
    );
    if (descendantFiles.length > 0) {
      await Promise.all(
        descendantFiles.map((f) => f.fileUrl && fs.unlink(f.fileUrl)),
      );
    }
    await prisma.block.delete({ where: { id: folder.id } });
    res.redirect(
      folder.parentFolder && folder.parentFolder.type != 'ROOT'
        ? `/folders/${folder.parentFolder.id}`
        : '/home',
    );
  }),
];

export default {
  folderGet,
  createFolderGet,
  createFolderPost,
  updateFolderGet,
  updateFolderPost,
  deleteFolderGet,
  deleteFolderPost,
};
