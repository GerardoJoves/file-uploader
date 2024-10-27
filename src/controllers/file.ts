import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';
import upload from '../lib/multer.js';
import { Block } from '@prisma/client';

const fileGet = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;
  const file = await prisma.block.findUnique({
    where: {
      id: req.params.id,
      ownerId: user.id,
      type: 'FILE',
      deletionTime: null,
    },
    include: { parentFolder: true },
  });
  if (!file) throw new Error('404');
  res.render('pages/file', { title: file.name, file });
});

const uploadFileGet = (_req: Request, res: Response) => {
  res.render('pages/upload_file_form', { title: 'Uplaod File' });
};

const uploadFilePost = [
  upload.single('uploaded_file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new Error('400');
    const user = req.user as Express.User;
    const file = req.file;
    const parentFolder = req.parentFolder as Block;
    const fileBase64 = decode(file.buffer.toString('base64'));
    const storePath = uuidv4();
    const record = await prisma.block.create({
      data: {
        parentFolderId: parentFolder.id,
        storePath,
        ownerId: user.id,
        name: file.originalname,
        contentType: file.mimetype,
        type: 'FILE',
        sizeInBytes: file.size,
      },
    });
    const storeUpload = await supabase.storage
      .from('files')
      .upload(storePath, fileBase64, {
        contentType: file.mimetype,
      });
    if (storeUpload.error) {
      await prisma.block.delete({ where: { id: record.id } });
    } else {
      await prisma.block.update({
        where: { id: record.id },
        data: { uploadTime: new Date() },
      });
    }

    res.redirect(
      parentFolder.type === 'ROOT' ? '/home' : `/folders/${parentFolder.id}`,
    );
  }),
];

const deleteFilePost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;
  const file = await prisma.block.update({
    where: {
      id: req.params.id,
      type: 'FILE',
      ownerId: user.id,
      deletionTime: null,
    },
    data: { deletionTime: new Date() },
    include: { parentFolder: true },
  });
  const storeRemoval = await supabase.storage
    .from('files')
    .remove([file.storePath as string]);
  if (storeRemoval.error) {
    await prisma.block.update({
      where: { id: file.id },
      data: { deletionTime: null },
    });
  } else {
    await prisma.block.delete({ where: { id: file.id } });
  }
  res.redirect(
    file.parentFolder && file.parentFolder.type != 'ROOT'
      ? `/folders/${file.parentFolder.id}`
      : '/home',
  );
});

const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;
  const file = await prisma.block.findUnique({
    where: { id: req.params.id, type: 'FILE', ownerId: user.id },
  });
  if (!file) throw new Error('404');
  const storeResult = await supabase.storage
    .from('files')
    .createSignedUrl(file.storePath as string, 60, {
      download: true,
    });
  if (storeResult.error) throw new Error('500');
  res.redirect(storeResult.data.signedUrl);
});

export default {
  fileGet,
  uploadFileGet,
  uploadFilePost,
  deleteFilePost,
  downloadFile,
};
