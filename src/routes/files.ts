import { Router } from 'express';

import fileController from '../controllers/file.js';
import isAuthenticated from 'src/middleware/isAuthenticated.js';

const router = Router();

router.use(isAuthenticated);

router.get('/:id/download', fileController.downloadFileGet);
router.post('/:id/delete', fileController.deleteFilePost);
router.post('/:id/update', fileController.updateFilePost);
router.get('/:id', fileController.fileGet);

export default router;
