import express from 'express';
import {
    getPendingRecipes,
    getAllRecipesAdmin,
    getRecipeByIdAdmin,
    approveRecipe,
    rejectRecipe,
    getModerationStats,
    getUsersForModeration,
    promoteUserToModerator,
    deleteUserAccount,
    getUserModerationStats,
    setUserRoleBySuperAdmin,
} from '../controllers/admin.controller.js';
import { authenticateToken, requireModerator, requireAdmin, requireSuperAdmin } from '../middlewares/auth.middleware.js';
import { body, query, param } from 'express-validator';
import { validate } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/users/stats', requireModerator, getUserModerationStats);

router.get(
    '/users',
    requireModerator,
    [
        query('role').optional().isIn(['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']).withMessage('Invalid role filter'),
        query('createdFrom').optional().isISO8601().withMessage('Invalid createdFrom date'),
        query('createdTo').optional().isISO8601().withMessage('Invalid createdTo date'),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    ],
    validate,
    getUsersForModeration
);


router.delete(
    '/users/:id',
    requireModerator,
    [
        param('id').isString().trim().notEmpty().withMessage('User id is required')
    ],
    validate,
    deleteUserAccount
);

router.put(
    '/users/:id/promote',
    requireAdmin,
    [
        param('id').isString().trim().notEmpty().withMessage('User id is required')
    ],
    validate,
    promoteUserToModerator
);

router.patch(
    '/users/:id/role',
    requireSuperAdmin,
    [
        param('id').isString().trim().notEmpty().withMessage('User id is required'),
        body('role').isIn(['USER', 'MODERATOR', 'ADMIN']).withMessage('Invalid target role')
    ],
    validate,
    setUserRoleBySuperAdmin
);

router.get('/recipes/pending', requireAdmin, getPendingRecipes);

router.get('/stats', requireAdmin, getModerationStats);

router.get('/recipes', requireAdmin, getAllRecipesAdmin);

router.get('/recipes/:id', requireAdmin, getRecipeByIdAdmin);


router.put(
    '/recipes/:id/approve',
    requireAdmin,
    [
        param('id').isString().trim().notEmpty().withMessage('Recipe id is required'),
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
    requireAdmin,
    [
        param('id').isString().trim().notEmpty().withMessage('Recipe id is required'),
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