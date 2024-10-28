import { Router } from 'express';

import folderController from '../controllers/folder.js';
import fileController from '../controllers/file.js';
import isAuthenticated from 'src/middleware/isAuthenticated.js';
import { setParentFolderById } from 'src/middleware/setParentFolder.js';

const router = Router();

router.use(isAuthenticated);

router.post('/:id/upload_file', fileController.uploadFilePost);
router.post(
  '/:id/create_folder',
  setParentFolderById,
  folderController.createFolderPost,
);
router.post('/:id/update', folderController.updateFolderPost);
router.post('/:id/delete', folderController.deleteFolderPost);
router.get('/:id', folderController.folderGet);

export default router;
