import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { decode } from 'base64-arraybuffer';
import { validationResult, matchedData } from 'express-validator';

import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';
import upload from '../lib/multer.js';
import {
  blockIdParamValidation,
  blockIdValidation,
  blockNameValidation,
} from '../middleware/validation.js';

const fileGet = [
  blockIdParamValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const { id } = matchedData<{ id: string }>(req, { locations: ['params'] });
    const user = req.user as Express.User;
    const file = await prisma.block.findUnique({
      where: {
        id: id,
        ownerId: user.id,
        type: 'FILE',
        deletionTime: null,
      },
      include: { parentFolder: true },
    });
    if (!file) throw new Error('404');
    res.json(file);
  }),
];

const uploadFilePost = [
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new Error('400');
    if (!req.parentFolder) throw new Error('500');
    const user = req.user as Express.User;
    const { parentFolder } = req;
    const file = req.file;
    const fileBase64 = decode(file.buffer.toString('base64'));
    const record = await prisma.block.create({
      data: {
        parentFolderId: parentFolder.id,
        ownerId: user.id,
        name: file.originalname,
        contentType: file.mimetype,
        type: 'FILE',
        sizeInBytes: file.size,
      },
    });
    const storeUpload = await supabase.storage
      .from('files')
      .upload(record.id, fileBase64, {
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

    res.status(200).json({ status: 'success' });
  }),
];

const deleteFilePost = [
  blockIdValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const { id } = matchedData<{ id: string }>(req, { locations: ['body'] });
    const user = req.user as Express.User;
    const file = await prisma.block.update({
      where: {
        id: id,
        type: 'FILE',
        ownerId: user.id,
        deletionTime: null,
      },
      data: { deletionTime: new Date() },
      include: { parentFolder: true },
    });
    const storeRemoval = await supabase.storage.from('files').remove([file.id]);
    if (storeRemoval.error) {
      await prisma.block.update({
        where: { id: file.id },
        data: { deletionTime: null },
      });
    } else {
      await prisma.block.delete({ where: { id: file.id } });
    }
    res.status(200).json({ status: 'success' });
  }),
];

const downloadFileGet = [
  blockIdParamValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const { id } = matchedData<{ id: string }>(req, { locations: ['params'] });
    const user = req.user as Express.User;
    const file = await prisma.block.findUnique({
      where: {
        id: id,
        type: 'FILE',
        ownerId: user.id,
        deletionTime: null,
      },
    });
    if (!file) throw new Error('404');
    const storeResult = await supabase.storage
      .from('files')
      .createSignedUrl(file.id, 60, {
        download: file.name,
      });
    if (storeResult.error) throw new Error('500');
    res.redirect(storeResult.data.signedUrl);
  }),
];

const updateFilePost = [
  blockNameValidation(),
  blockIdValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const user = req.user as Express.User;
    const { id, name } = matchedData<{ id: string; name: string }>(req);
    await prisma.block.update({
      where: {
        id: id,
        ownerId: user.id,
        type: 'FILE',
        deletionTime: null,
      },
      data: { name: name },
    });
    res.status(200).json({ status: 'success' });
  }),
];

export default {
  fileGet,
  uploadFilePost,
  deleteFilePost,
  downloadFileGet,
  updateFilePost,
};
