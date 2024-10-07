import path from 'node:path';

import { Request, Response } from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';

import prisma from '../lib/prisma.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import hasFolderWriteAccess from 'src/middleware/hasFolderWriteAccess.js';

const upload = multer({
  dest: path.join(import.meta.dirname, '../../uploads'),
});

const fileGet = [
  isAuthenticated,
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
  isAuthenticated,
  (_req: Request, res: Response) => {
    res.render('pages/upload_file_form', { title: 'Uplaod File' });
  },
];

const uploadFilePost = [
  isAuthenticated,
  hasFolderWriteAccess,
  upload.single('uploaded_file'),
  asyncHandler(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const user = req.user as Express.User;
    let parentFolderId = req.params.id ? parseInt(req.params.id) : null;
    if (!file) throw new Error('400');
    if (parentFolderId == null) {
      const root = await prisma.block.findFirst({
        where: { ownerId: user.id, type: 'ROOT' },
      });
      if (!root) throw new Error('404');
      parentFolderId = root.id;
    } else if (isNaN(parentFolderId)) {
      throw new Error('400');
    }
    await prisma.block.create({
      data: {
        ownerId: user.id,
        name: file.originalname,
        contentType: file.mimetype,
        fileUrl: file.path,
        type: 'FILE',
        sizeInBytes: file.size,
        parentFolderId,
      },
    });
    res.redirect(req.params.id ? `/folders/${parentFolderId}` : '/home');
  }),
];

export default {
  fileGet,
  uploadFileGet,
  uploadFilePost,
};
