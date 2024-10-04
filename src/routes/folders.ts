import { Router } from 'express';

import blockController from '../controllers/block.js';

const router = Router();

router
  .route('/:id/upload_file')
  .get(blockController.uploadFileGet)
  .post(blockController.uploadFilePost);

router
  .route('/:id/create_folder')
  .get(blockController.createChildFolderGet)
  .post(blockController.createChildFolderPost);

router.get('/:id', blockController.folderGet);

export default router;
