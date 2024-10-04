import { Router } from 'express';

import folderController from '../controllers/folder.js';
import fileController from '../controllers/file.js';

const router = Router();

router.get('/', folderController.rootFolderGet);

router
  .route('/upload_file')
  .get(fileController.uploadFileGet)
  .post(fileController.uploadRootFilePost);

router
  .route('/create_folder')
  .get(folderController.createChildFolderGet)
  .post(folderController.createRootChildFolderPost);

export default router;
