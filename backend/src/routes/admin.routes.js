import express from 'express';
import {
    getPendingRecipes,
    getAllRecipesAdmin,
    approveRecipe,
    rejectRecipe,
    getModerationStats
} from '../controllers/admin.controller.js';
import { authenticateToken, requireModerator, requireAdmin } from '../middlewares/auth.middleware.js';
import { body } from 'express-validator';
import { validate } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireModerator);

router.get('/recipes/pending', getPendingRecipes);

router.get('/recipes', getAllRecipesAdmin);

router.get('/stats', getModerationStats);

router.put(
    '/recipes/:id/approve',
    [
        body('note')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Note must be less than 500 characters')
    ],
    validate,
    approveRecipe
);

router.put(
    '/recipes/:id/reject',
    [
        body('reason')
            .trim()
            .notEmpty()
            .withMessage('Rejection reason is required')
            .isLength({ min: 10, max: 500 })
            .withMessage('Reason must be between 10 and 500 characters')
    ],
    validate,
    rejectRecipe
);

export default router;