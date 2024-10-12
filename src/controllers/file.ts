import { Request, Response } from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import hasFolderWriteAccess from 'src/middleware/hasFolderWriteAccess.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
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
    const fileBase64 = decode(file.buffer.toString('base64'));
    const { data, error } = await supabase.storage
      .from('files')
      .upload(uuidv4(), fileBase64, {
        contentType: file.mimetype,
      });
    if (error) throw new Error('500');
    await prisma.block.create({
      data: {
        ownerId: user.id,
        name: file.originalname,
        contentType: file.mimetype,
        fileUrl: data.path,
        type: 'FILE',
        sizeInBytes: file.size,
        parentFolderId,
      },
    });
    res.redirect(req.params.id ? `/folders/${parentFolderId}` : '/home');
  }),
];

const deleteFilePost = [
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const fileId = parseInt(req.params.id);
    if (isNaN(fileId)) throw new Error('400');
    const file = await prisma.block.findUnique({
      where: { id: fileId, type: 'FILE' },
      include: { parentFolder: true },
    });
    if (!file) return res.redirect('/home');
    if (file.ownerId != user.id) throw new Error('401');
    if (!file.fileUrl) throw new Error('500');
    const { error } = await supabase.storage
      .from('files')
      .remove([file.fileUrl]);
    if (error) throw new Error('500');
    await prisma.block.delete({ where: { id: file.id } });
    res.redirect(
      file.parentFolder && file.parentFolder.type != 'ROOT'
        ? `/folders/${file.parentFolder.id}`
        : '/home',
    );
  }),
];

const downloadFile = [
  isAuthenticated,
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const fileId = parseInt(req.params.id);
    if (isNaN(fileId)) throw new Error('400');
    const file = await prisma.block.findUnique({
      where: { id: fileId, type: 'FILE' },
    });
    if (!file) throw new Error('404');
    if (file.ownerId != user.id) throw new Error('401');
    if (!file.fileUrl) throw new Error('500');
    const { data } = await supabase.storage
      .from('files')
      .createSignedUrl(file.fileUrl, 60, {
        download: true,
      });
    if (!data) throw new Error('500');
    res.redirect(data.signedUrl);
  }),
];

export default {
  fileGet,
  uploadFileGet,
  uploadFilePost,
  deleteFilePost,
  downloadFile,
};
