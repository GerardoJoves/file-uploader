import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { matchedData, validationResult } from 'express-validator';
import { Block, Prisma } from '@prisma/client';
import { updateDeletionTimeCascadeReturningStorePaths } from '@prisma/client/sql';

import prisma from '../lib/prisma.js';
import { folderNameValidation } from '../middleware/validation.js';
import supabase from 'src/lib/supabase.js';

const folderGet = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;
  const id = req.params.id ? parseInt(req.params.id) : null;
  const where: Prisma.BlockWhereInput =
    id === null
      ? { type: 'ROOT', ownerId: user.id }
      : { type: 'FOLDER', id: id, ownerId: user.id, deletionTime: null };
  const include: Prisma.BlockInclude = {
    children: { where: { deletionTime: null }, orderBy: { type: 'desc' } },
    parentFolder: true,
  };
  const folder = await prisma.block.findFirst({ where, include });
  if (!folder) throw new Error('404');
  res.render('pages/folder', { title: folder.name, folder });
});

const createFolderGet = (_req: Request, res: Response) => {
  res.render('pages/create_folder_form', { title: 'Create Folder' });
};

const createFolderPost = [
  folderNameValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('pages/create_folder_form', {
        title: 'Create Folder',
        errors: errors.array(),
      });
    }
    const user = req.user as Express.User;
    const parentFolder = req.parentFolder as Block;
    const { folderName } = matchedData<{ folderName: string }>(req);
    await prisma.block.create({
      data: {
        name: folderName,
        type: 'FOLDER',
        ownerId: user.id,
        parentFolderId: parentFolder.id,
        uploadTime: new Date(),
      },
    });
    res.redirect(
      parentFolder.type === 'ROOT' ? '/home' : `/folders/${parentFolder.id}`,
    );
  }),
];

const updateFolderGet = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;
  const folderId = parseInt(req.params.id);
  if (isNaN(folderId)) throw new Error('400');
  const folder = await prisma.block.findUnique({
    where: { id: folderId, type: 'FOLDER', ownerId: user.id },
  });
  res.render('pages/create_folder_form', { title: 'Update Folder', folder });
});

const updateFolderPost = [
  folderNameValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('pages/create_folder_form', {
        title: 'Update Folder',
        errors: errors.array(),
      });
    }
    const user = req.user as Express.User;
    const folderId = parseInt(req.params.id);
    const { folderName } = matchedData<{ folderName: string }>(req);
    if (isNaN(folderId)) throw new Error('400');
    const updatedFolder = await prisma.block.update({
      where: {
        id: folderId,
        ownerId: user.id,
        type: 'FOLDER',
        deletionTime: null,
      },
      data: { name: folderName },
      include: { parentFolder: true },
    });
    res.redirect(updatedFolder ? `/folders/${updatedFolder.id}` : '/home');
  }),
];

const deleteFolderGet = asyncHandler(async (req: Request, res: Response) => {
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
});

const deleteFolderPost = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;
  const folderId = parseInt(req.params.id);
  if (isNaN(folderId)) throw new Error('400');
  const folder = await prisma.block.findUnique({
    where: { id: folderId, type: 'FOLDER', ownerId: user.id },
    include: { parentFolder: true },
  });
  if (!folder) return res.redirect('/home');

  const deletedFiles = await prisma.$queryRawTyped(
    updateDeletionTimeCascadeReturningStorePaths(folder.id, new Date()),
  );
  const storePaths: string[] = [];
  deletedFiles.forEach(({ storePath: p }) => p && storePaths.push(p));
  let storeError = null;
  if (storePaths.length > 0) {
    const { error } = await supabase.storage.from('files').remove(storePaths);
    storeError = error;
  }
  if (!storeError) await prisma.block.delete({ where: { id: folder.id } });

  res.redirect(
    folder.parentFolder && folder.parentFolder.type != 'ROOT'
      ? `/folders/${folder.parentFolder.id}`
      : '/home',
  );
});

export default {
  folderGet,
  createFolderGet,
  createFolderPost,
  updateFolderGet,
  updateFolderPost,
  deleteFolderGet,
  deleteFolderPost,
};
