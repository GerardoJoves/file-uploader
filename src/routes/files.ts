import { Router } from 'express';

import fileController from '../controllers/file.js';

const router = Router();

router.get('/:id', fileController.fileGet);

export default router;
