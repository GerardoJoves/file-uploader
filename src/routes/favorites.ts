import { Router } from 'express';

import favoritesController from '../controllers/favorites.js';
import isAuthenticated from 'src/middleware/isAuthenticated.js';

const router = Router();

router.use(isAuthenticated);

router.get('/', favoritesController.favoritesGet);
router.post('/add', favoritesController.addToFavoritesPost);
router.post('/remove', favoritesController.removeFromFavorites);

export default router;
