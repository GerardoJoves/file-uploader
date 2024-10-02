import path from 'node:path';

import { Request, Response } from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';

import prisma from '../lib/prisma.js';
import checkAuth from '../middleware/checkAuth.js';
import { folderNameValidation } from '../middleware/validation.js';

const upload = multer({
  dest: path.join(import.meta.dirname, '../../uploads'),
});

const uploadFileGet = [
  checkAuth,
  (_req: Request, res: Response) => {
    res.render('pages/upload_file_form', { title: 'Uplaod File' });
  },
];

const uploadFilePost = [
  checkAuth,
  upload.single('uploaded_file'),
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const user = req.user as Express.User;
    const folderId = parseInt(req.params.id);
    if (isNaN(folderId)) throw new Error('invalid folder id');
    const parentFolder = await prisma.block.findUnique({
      select: { id: true, type: true },
      where: { id: folderId, ownerId: user.id },
    });
    if (!parentFolder) throw new Error('404');
    await prisma.block.create({
      data: {
        ownerId: user.id,
        name: file.originalname,
        contentType: file.mimetype,
        fileUrl: file.path,
        type: 'FILE',
        sizeInBytes: file.size,
        parentFolderId: parentFolder.id,
      },
    });
    const path =
      parentFolder.type === 'ROOT' ? '/home' : '/folders' + parentFolder.id;
    res.redirect(path);
  }),
];

const createFolderGet = (_req: Request, res: Response) => {
  res.render('pages/create_folder_form', { title: 'Create Folder' });
};

const createFolderPost = [
  checkAuth,
  folderNameValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const parentFolderId = parseInt(req.params.id);
    if (isNaN(parentFolderId)) throw new Error('invalid folder id');
    if (!errors.isEmpty()) {
      res.render('pages/create_folder_form', {
        title: 'Create Folder',
        errors: errors.array(),
      });
      return;
    }
    const user = req.user as Express.User;
    const { folderName: childName } = matchedData<{ folderName: string }>(req);
    const parentFolder = await prisma.block.findUnique({
      select: { id: true, type: true },
      where: { id: parentFolderId, ownerId: user.id },
    });
    if (!parentFolder || parentFolder.type === 'FILE') throw new Error('404');
    await prisma.block.create({
      data: {
        name: childName,
        type: 'FOLDER',
        ownerId: user.id,
        parentFolderId: parentFolder.id,
      },
    });
    const path =
      parentFolder.type === 'ROOT' ? '/home' : '/folders' + parentFolder.id;
    res.redirect(path);
  }),
];

const rootFolderGet = [
  checkAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const root = await prisma.block.findFirst({
      where: { ownerId: user.id, type: 'ROOT' },
      include: { children: true },
    });
    res.render('pages/home', { folder: root, user });
  }),
];

export default {
  uploadFileGet,
  uploadFilePost,
  createFolderGet,
  createFolderPost,
  rootFolderGet,
};
