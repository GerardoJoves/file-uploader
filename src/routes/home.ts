import { Router } from 'express';

import folderController from '../controllers/folder.js';
import fileController from '../controllers/file.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import { setParentFolderUserRoot } from '../middleware/setParentFolder.js';

const router = Router();

router.use(isAuthenticated);

router.get('/', folderController.folderGet);

router.post(
  '/upload_file',
  setParentFolderUserRoot,
  fileController.uploadFilePost,
);

router.post(
  '/create_folder',
  setParentFolderUserRoot,
  folderController.createFolderPost,
);

export default router;
