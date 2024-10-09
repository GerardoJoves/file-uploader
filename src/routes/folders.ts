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
  .get(folderController.createFolderGet)
  .post(folderController.createFolderPost);

router
  .route('/:id/update')
  .get(folderController.updateFolderGet)
  .post(folderController.updateFolderPost);

router
  .route('/:id/delete')
  .get(folderController.deleteFolderGet)
  .post(folderController.deleteFolderPost);

router.get('/:id', folderController.folderGet);

export default router;
