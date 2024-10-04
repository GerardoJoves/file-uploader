import { Router } from 'express';

import folderController from '../controllers/folder.js';
import fileController from '../controllers/file.js';

const router = Router();

router
  .route('/:id/upload_file')
  .get(fileController.uploadFileGet)
  .post(fileController.uploadFilePost);

router
  .route('/:id/create_folder')
  .get(folderController.createChildFolderGet)
  .post(folderController.createChildFolderPost);

router.get('/:id', folderController.folderGet);

export default router;
