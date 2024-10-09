import { Router } from 'express';

import fileController from '../controllers/file.js';

const router = Router();

router.post('/:id/delete', fileController.deleteFilePost);
router.get('/:id', fileController.fileGet);

export default router;
