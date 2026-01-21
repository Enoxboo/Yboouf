import express from 'express';
import { getMyRecipes, getMyStats, getProfile } from '../controllers/users.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/profile', getProfile);

router.get('/recipes', getMyRecipes);

router.get('/stats', getMyStats);

export default router;