import { Router } from 'express';

import blockController from '../controllers/block.js';

const router = Router();

router.get('/', blockController.rootGet);

router
  .route('/upload_file')
  .get(blockController.uploadFileGet)
  .post(blockController.uploadRootFilePost);

router
  .route('/create_folder')
  .get(blockController.createChildFolderGet)
  .post(blockController.createRootChildFolderPost);

export default router;
