import { Router } from 'express';

import fileController from '../controllers/file.js';
import isAuthenticated from 'src/middleware/isAuthenticated.js';

const router = Router();

router.use(isAuthenticated);

router.post('/delete', fileController.deleteFilePost);
router.post('/update', fileController.updateFilePost);

router.get('/:id/download', fileController.downloadFileGet);
router.get('/:id', fileController.fileGet);

export default router;
