import { Router } from 'express';

import folderController from '../controllers/folder.js';
import fileController from '../controllers/file.js';

const router = Router();

router.get('/', folderController.folderGet);

router
  .route('/upload_file')
  .get(fileController.uploadFileGet)
  .post(fileController.uploadFilePost);

router
  .route('/create_folder')
  .get(folderController.createFolderGet)
  .post(folderController.createFolderPost);

export default router;
