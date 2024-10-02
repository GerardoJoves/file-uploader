import { Router } from 'express';

import blockController from '../controllers/block.js';

const router = Router();

router.get('/', blockController.rootFolderGet);

export default router;
