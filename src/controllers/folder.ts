import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';
import { format } from 'date-fns';
import { markAsDeletedCascade } from '@prisma/client/sql';

import convertFileSize from '../helpers/convertFileSize.js';
import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';
import {
  blockIdParamValidation,
  blockIdValidation,
  blockNameValidation,
} from '../middleware/validation.js';

const userRootGet = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;

  const folder = await prisma.block.findFirst({
    where: { type: 'ROOT', ownerId: user.id },
    include: {
      children: {
        where: { deletionTime: null },
        orderBy: [{ type: 'desc' }, { name: 'asc' }],
        include: { owner: { select: { id: true, username: true } } },
      },
      parentFolder: true,
    },
  });

  if (!folder) throw new Error('500');
  res.render('pages/folder', {
    title: folder.name,
    folder,
    user,
    format,
    convertFileSize,
  });
});

const folderGet = [
  blockIdParamValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const { id } = matchedData<{ id: string }>(req, { locations: ['params'] });
    const user = req.user as Express.User;

    const folder = await prisma.block.findFirst({
      where: { type: 'FOLDER', id: id, ownerId: user.id, deletionTime: null },
      include: {
        children: {
          where: { deletionTime: null },
          orderBy: [{ type: 'desc' }, { name: 'asc' }],
          include: { owner: { select: { id: true, username: true } } },
        },
        parentFolder: true,
      },
    });

    if (!folder) throw new Error('404');
    res.render('pages/folder', {
      title: folder.name,
      folder,
      user,
      format,
      convertFileSize,
    });
  }),
];

const createFolderPost = [
  blockNameValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.parentFolder) throw new Error('500');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).end();
      return;
    }
    const user = req.user as Express.User;
    const { parentFolder } = req;
    const { name } = matchedData<{ name: string }>(req);
    await prisma.block.create({
      data: {
        name: name,
        type: 'FOLDER',
        ownerId: user.id,
        parentFolderId: parentFolder.id,
        uploadTime: new Date(),
      },
    });

    res.status(200).json({ status: 'success' });
  }),
];

const updateFolderPost = [
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
        type: 'FOLDER',
        deletionTime: null,
      },
      data: { name: name },
    });
    res.status(200).json({ status: 'success' });
  }),
];

const deleteFolderPost = [
  blockIdValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const { id } = matchedData<{ id: string }>(req);
    const user = req.user as Express.User;
    const folder = await prisma.block.findUnique({
      where: { id: id, type: 'FOLDER', ownerId: user.id },
      include: { parentFolder: true },
    });
    if (!folder) return res.redirect('/home');

    const deletedBlocks = await prisma.$queryRawTyped(
      markAsDeletedCascade(folder.id, new Date()),
    );
    const deletedFileIds: string[] = [];
    deletedBlocks.forEach((block) => {
      if (block.type === 'FILE') deletedFileIds.push(block.id);
    });

    let storeError;
    if (deletedFileIds.length > 0) {
      const { error } = await supabase.storage
        .from('files')
        .remove(deletedFileIds);
      storeError = error;
    }
    if (!storeError) await prisma.block.delete({ where: { id: folder.id } });

    res.status(200).json({ status: 'success' });
  }),
];

export default {
  userRootGet,
  folderGet,
  createFolderPost,
  updateFolderPost,
  deleteFolderPost,
};
