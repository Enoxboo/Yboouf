import express from 'express';
import { body } from 'express-validator';
import {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
} from '../controllers/recipes.controller.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';

const router = express.Router();

const recipeValidation = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('country')
        .trim()
        .notEmpty()
        .withMessage('Country is required'),
    body('prepTime')
        .isInt({ min: 0, max: 1440 })
        .withMessage('Prep time must be between 0 and 1440 minutes'),
    body('cookTime')
        .isInt({ min: 0, max: 1440 })
        .withMessage('Cook time must be between 0 and 1440 minutes'),
    body('servings')
        .isInt({ min: 1, max: 50 })
        .withMessage('Servings must be between 1 and 50'),
    body('difficulty')
        .isIn(['EASY', 'MEDIUM', 'HARD'])
        .withMessage('Difficulty must be EASY, MEDIUM, or HARD'),
    body('type')
        .isIn(['STARTER', 'MAIN', 'DESSERT', 'SNACK', 'DRINK'])
        .withMessage('Type must be STARTER, MAIN, DESSERT, SNACK, or DRINK'),
    body('instructions')
        .trim()
        .isLength({ min: 20 })
        .withMessage('Instructions must be at least 20 characters'),
];

router.get('/', optionalAuth, getAllRecipes);
router.get('/:id', optionalAuth, getRecipeById);

router.post(
    '/',
    authenticateToken,
    uploadSingle,
    recipeValidation,
    validate,
    createRecipe
);

router.put(
    '/:id',
    authenticateToken,
    uploadSingle,
    recipeValidation,
    validate,
    updateRecipe
);

router.delete('/:id', authenticateToken, deleteRecipe);

export default router;