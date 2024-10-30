import { validationResult, matchedData } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

import { searchQueryValidation } from '../middleware/validation.js';
import prisma from '../lib/prisma.js';
import convertFileSize from '../helpers/convertFileSize.js';
import { format } from 'date-fns';

const searchResultGet = [
  searchQueryValidation(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error('400');
    const user = req.user as Express.User;
    const { q } = matchedData<{ q: string }>(req);
    const result = await prisma.block.findMany({
      where: {
        ownerId: user.id,
        type: { in: ['FILE', 'FOLDER'] },
        name: { contains: q, mode: 'insensitive' },
      },
      orderBy: { type: 'desc' },
      include: { owner: true },
    });
    res.render('pages/folder', {
      title: 'search',
      folder: { name: 'Search result', children: result },
      user,
      format,
      convertFileSize,
      folderPath: '/home',
    });
  }),
];

export default { searchResultGet };
