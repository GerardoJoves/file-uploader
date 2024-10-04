import { Router } from 'express';

import blockController from '../controllers/block.js';

const router = Router();

router.get('/:id', blockController.fileGet);

export default router;
