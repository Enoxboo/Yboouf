import express from 'express';
import {body} from 'express-validator';
import {
    getAllRecipes,
    getRecipeById,
    getRecipeFilters,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    rateRecipe,
    addToFavorites,
    removeFromFavorites,
    addComment,
    deleteComment,
} from '../controllers/recipes.controller.js';
import {authenticateToken, optionalAuth} from '../middlewares/auth.middleware.js';
import {uploadSingle} from '../middlewares/upload.middleware.js';
import {validate} from '../middlewares/validation.middleware.js';

const router = express.Router();

const recipeValidation = [
    body('title')
        .trim()
        .isLength({min: 3, max: 100})
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .isLength({min: 10, max: 500})
        .withMessage('Description must be between 10 and 500 characters'),
    body('country')
        .trim()
        .notEmpty()
        .withMessage('Country is required'),
    body('prepTime')
        .isInt({min: 0, max: 1440})
        .withMessage('Prep time must be between 0 and 1440 minutes'),
    body('cookTime')
        .isInt({min: 0, max: 1440})
        .withMessage('Cook time must be between 0 and 1440 minutes'),
    body('servings')
        .isInt({min: 1, max: 50})
        .withMessage('Servings must be between 1 and 50'),
    body('difficulty')
        .isIn(['EASY', 'MEDIUM', 'HARD'])
        .withMessage('Difficulty must be EASY, MEDIUM, or HARD'),
    body('type')
        .isIn(['STARTER', 'MAIN', 'DESSERT', 'SNACK', 'DRINK'])
        .withMessage('Type must be STARTER, MAIN, DESSERT, SNACK, or DRINK'),
    body('instructions')
        .trim()
        .isLength({min: 20})
        .withMessage('Instructions must be at least 20 characters'),
];

const commentValidation = [
    body('content')
        .trim()
        .isLength({min: 1, max: 1000})
        .withMessage('Comment must be between 1 and 1000 characters'),
];

router.get('/', optionalAuth, getAllRecipes);
router.get('/filters', getRecipeFilters);

router.post(
    '/',
    authenticateToken,
    uploadSingle,
    recipeValidation,
    validate,
    createRecipe
);

router.post('/:id/rate', authenticateToken, rateRecipe);
router.post('/:id/favorite', authenticateToken, addToFavorites);
router.delete('/:id/favorite', authenticateToken, removeFromFavorites);

// Comment routes - MUST be before generic :id routes
router.post('/:id/comments', authenticateToken, commentValidation, validate, addComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

router.put(
    '/:id',
    authenticateToken,
    uploadSingle,
    recipeValidation,
    validate,
    updateRecipe
);

router.delete('/:id', authenticateToken, deleteRecipe);
router.get('/:id', optionalAuth, getRecipeById);


export default router;