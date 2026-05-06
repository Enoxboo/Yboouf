import express from 'express';
import { getMyRecipes, getMyStats, getProfile, getMyFavorites } from '../controllers/users.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);

router.get('/recipes', getMyRecipes);

router.get('/stats', getMyStats);

router.get('/favorites', getMyFavorites);

export default router;