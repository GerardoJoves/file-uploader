import path from 'node:path';

import { Request, Response } from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';

import prisma from '../lib/prisma.js';
import checkAuth from '../middleware/checkAuth.js';
import checkFolderWriteAccess from 'src/middleware/checkFolderWriteAccess.js';
import { folderNameValidation } from '../middleware/validation.js';

const upload = multer({
  dest: path.join(import.meta.dirname, '../../uploads'),
});

async function createFile(
  file: Express.Multer.File,
  user: Express.User,
  parentId: number,
) {
  return await prisma.block.create({
    data: {
      ownerId: user.id,
      name: file.originalname,
      contentType: file.mimetype,
      fileUrl: file.path,
      type: 'FILE',
      sizeInBytes: file.size,
      parentFolderId: parentId,
    },
  });
}

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

const uploadFileGet = [
  checkAuth,
  (_req: Request, res: Response) => {
    res.render('pages/upload_file_form', { title: 'Uplaod File' });
  },
];

const uploadFilePost = [
  checkAuth,
  checkFolderWriteAccess,
  upload.single('uploaded_file'),
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const user = req.user as Express.User;
    const folderId = parseInt(req.params.id);
    await createFile(file, user, folderId);
    res.redirect('/folders/' + folderId);
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
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const { folderName } = matchedData<{ folderName: string }>(req);
    const errors = validationResult(req);
    const parentFolderId = parseInt(req.params.id);
    if (!errors.isEmpty()) {
      const locals = { title: 'Create Folder', errors: errors.array() };
      res.render('pages/create_folder_form', locals);
      return;
    }
    await createFolder(folderName, user, parentFolderId);
    res.redirect('/folders/' + parentFolderId);
  }),
];

const rootGet = [
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

const uploadRootFilePost = [
  checkAuth,
  upload.single('uploaded_file'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const file = req.file as Express.Multer.File;
    const folderId = parseInt(req.params.id);
    if (isNaN(folderId)) throw new Error('400');
    const root = await prisma.block.findUnique({
      where: { id: folderId, ownerId: user.id, type: 'ROOT' },
    });
    if (!root) throw new Error('404');
    await createFile(file, user, root.id);
    res.redirect('/home');
  }),
];

const createRootChildFolderPost = [
  checkAuth,
  folderNameValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const { folderName } = matchedData<{ folderName: string }>(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const locals = { title: 'Create Folder', errors: errors.array() };
      res.render('pages/create_folder_form', locals);
      return;
    }
    const root = await prisma.block.findFirst({
      where: { type: 'ROOT', ownerId: user.id },
    });
    if (!root) throw new Error('404');
    await createFolder(folderName, user, root.id);
    res.redirect('/home');
  }),
];

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

const fileGet = [
  checkAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new Error('400');
    const file = await prisma.block.findUnique({
      where: { id: id, ownerId: user.id, type: 'FILE' },
      include: { parentFolder: true },
    });
    if (!file) throw new Error('404');
    res.render('pages/file', { title: file.name, file });
  }),
];

export default {
  rootGet,
  folderGet,
  fileGet,
  uploadFileGet,
  uploadFilePost,
  uploadRootFilePost,
  createChildFolderGet,
  createChildFolderPost,
  createRootChildFolderPost,
};
