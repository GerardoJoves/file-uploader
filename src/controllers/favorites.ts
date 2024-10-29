import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { validationResult, matchedData } from 'express-validator';

import prisma from 'src/lib/prisma.js';
import convertFileSize from '../helpers/convertFileSize.js';
import { format } from 'date-fns';
import { blockIdValidation } from '../middleware/validation.js';

const favoritesGet = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as Express.User;
  const favorites = await prisma.block.findMany({
    where: {
      ownerId: user.id,
      type: { in: ['FILE', 'FOLDER'] },
      favorite: true,
      deletionTime: null,
    },
    orderBy: { type: 'desc' },
    include: { owner: true },
  });
  res.render('pages/folder', {
    title: 'Favorites',
    folder: { name: 'Favorites', children: favorites },
    user,
    format,
    convertFileSize,
    folderPath: '/home',
  });
});

const addToFavoritesPost = [
  blockIdValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const errors = validationResult(req);
    const { id } = matchedData<{ id: string }>(req);
    if (!errors.isEmpty()) throw new Error('500');
    const block = await prisma.block.update({
      where: { id: id, ownerId: user.id, type: { in: ['FILE', 'FOLDER'] } },
      data: { favorite: true },
      include: { parentFolder: true },
    });
    if (!block) throw new Error('404');
    const { parentFolder } = block;
    if (!parentFolder) throw new Error('500');
    res.status(200).json({ status: 'success' });
  }),
];

const removeFromFavorites = [
  blockIdValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as Express.User;
    const errors = validationResult(req);
    const { id } = matchedData<{ id: string }>(req);
    if (!errors.isEmpty()) throw new Error('500');
    const block = await prisma.block.findUnique({
      where: { id: id, ownerId: user.id, type: { in: ['FILE', 'FOLDER'] } },
    });
    if (!block) throw new Error('404');
    await prisma.block.update({
      where: { id: block.id },
      data: { favorite: false },
    });
    res.status(200).json({ status: 'success' });
  }),
];

export default { favoritesGet, addToFavoritesPost, removeFromFavorites };
