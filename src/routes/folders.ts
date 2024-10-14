import { Router } from 'express';

import folderController from '../controllers/folder.js';
import fileController from '../controllers/file.js';
import isAuthenticated from 'src/middleware/isAuthenticated.js';
import { setParentFolderById } from 'src/middleware/setParentFolder.js';

const router = Router();

router.use(isAuthenticated);

router
  .route('/:id/upload_file')
  .get(fileController.uploadFileGet)
  .post(setParentFolderById, fileController.uploadFilePost);

router
  .route('/:id/create_folder')
  .get(folderController.createFolderGet)
  .post(setParentFolderById, folderController.createFolderPost);

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
