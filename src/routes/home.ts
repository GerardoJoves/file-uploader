import { Router } from 'express';

import folderController from '../controllers/folder.js';
import fileController from '../controllers/file.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { setParentFolderUserRoot } from '../middleware/setParentFolder.js';

const router = Router();

router.use(isAuthenticated);

router.get('/', folderController.folderGet);

router
  .route('/upload_file')
  .get(fileController.uploadFileGet)
  .post(setParentFolderUserRoot, fileController.uploadFilePost);

router
  .route('/create_folder')
  .get(folderController.createFolderGet)
  .post(setParentFolderUserRoot, folderController.createFolderPost);

export default router;
