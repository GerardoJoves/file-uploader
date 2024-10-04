import path from 'node:path';

import { Request, Response } from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';

import prisma from '../lib/prisma.js';
import checkAuth from '../middleware/checkAuth.js';
import checkFolderWriteAccess from 'src/middleware/checkFolderWriteAccess.js';

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

const uploadFileGet = [
  checkAuth,
  (_req: Request, res: Response) => {
    res.render('pages/upload_file_form', { title: 'Uplaod File' });
  },
];

// Upload file to a regual folder
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

// Upload file to user's root folder
const uploadRootFilePost = [
  checkAuth,
  upload.single('uploaded_file'),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const file = req.file;
    const folderId = parseInt(req.params.id);
    if (!file || isNaN(folderId)) throw new Error('400');
    const root = await prisma.block.findUnique({
      where: { id: folderId, ownerId: user.id, type: 'ROOT' },
    });
    if (!root) throw new Error('404');
    await createFile(file, user, root.id);
    res.redirect('/home');
  }),
];

export default {
  fileGet,
  uploadFileGet,
  uploadFilePost,
  uploadRootFilePost,
};
