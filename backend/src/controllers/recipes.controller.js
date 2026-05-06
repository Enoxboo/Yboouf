import prisma from '../services/prisma.service.js';
import { deleteImage } from '../middlewares/upload.middleware.js';
import { isPrismaNotFoundError, sendError } from '../utils/helpers.js';

const ALLOWED_DIETS = new Set(['VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'HALAL', 'KOSHER']);

const parseIngredientsInput = (ingredients) => {
    const parsedIngredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;

    if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
        throw new Error('INVALID_INGREDIENTS');
    }

    const normalizedIngredients = parsedIngredients
        .map((ing) => ({
            name: String(ing?.name || '').trim(),
            quantity: String(ing?.quantity || '').trim(),
            unit: String(ing?.unit || '').trim(),
        }))
        .filter((ing) => ing.name && ing.quantity && ing.unit);

    if (normalizedIngredients.length === 0) {
        throw new Error('INVALID_INGREDIENTS');
    }

    return normalizedIngredients;
};

const parseDietInput = (diet) => {
    if (diet === undefined || diet === null) {
        return [];
    }

    const rawValues = Array.isArray(diet) ? diet : String(diet).split(',');
    const normalized = rawValues
        .map((value) => String(value).trim())
        .filter(Boolean);

    const uniqueValues = [...new Set(normalized)];

    if (!uniqueValues.every((value) => ALLOWED_DIETS.has(value))) {
        throw new Error('INVALID_DIET');
    }

    return uniqueValues;
};

export const getAllRecipes = async (req, res) => {
    try {
        const { search, country, type, diet, ingredients, page = 1, limit = 12 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            status: 'APPROVED',
            isPublished: true,
        };

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (country) {
            where.country = country;
        }

        if (type) {
            where.type = type;
        }

        if (diet) {
            where.diet = { has: diet };
        }

        if (ingredients) {
            where.ingredients = {
                some: {
                    name: { contains: ingredients, mode: 'insensitive' }
                }
            };
        }

        const [recipes, total] = await Promise.all([
            prisma.recipe.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    ingredients: true,
                    _count: {
                        select: {
                            favorites: true,
                            ratings: true,
                            comments: true,
                        },
                    },
                    ratings: {
                        select: {
                            score: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.recipe.count({ where }),
        ]);

        const recipesWithRatings = recipes.map(recipe => {
            const avgRating = recipe.ratings.length > 0
                ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
                : 0;

            const { ratings, ...recipeData } = recipe;

            return {
                ...recipeData,
                averageRating: Math.round(avgRating * 10) / 10,
            };
        });

        res.json({
            recipes: recipesWithRatings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get recipes error:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

export const getRecipeById = async (req, res) => {
    try {
        const { id } = req.params;

        const recipe = await prisma.recipe.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                ingredients: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
                ratings: {
                    select: {
                        score: true,
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        favorites: true,
                        comments: true,
                    },
                },
            },
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const avgRating = recipe.ratings.length > 0
            ? recipe.ratings.reduce((sum, r) => sum + r.score, 0) / recipe.ratings.length
            : 0;

        let userRating = null;
        if (req.user) {
            const userRatingObj = recipe.ratings.find(r => r.userId === req.user.id);
            userRating = userRatingObj ? userRatingObj.score : null;
        }

        let isFavorite = false;
        if (req.user) {
            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_recipeId: {
                        userId: req.user.id,
                        recipeId: id,
                    },
                },
            });
            isFavorite = !!favorite;
        }

        const { ratings, ...recipeData } = recipe;

        res.json({
            ...recipeData,
            averageRating: Math.round(avgRating * 10) / 10,
            ratingsCount: ratings.length,
            userRating,
            isFavorite,
        });
    } catch (error) {
        console.error('Get recipe error:', error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
};

export const createRecipe = async (req, res) => {
    try {
        const {
            title,
            description,
            country,
            prepTime,
            cookTime,
            servings,
            difficulty,
            type,
            diet,
            instructions,
            ingredients,
        } = req.body;

        const parsedIngredients = parseIngredientsInput(ingredients);
        const parsedDiet = parseDietInput(diet);

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        let status = 'PENDING';
        let isPublished = false;

        if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
            status = 'APPROVED';
            isPublished = true;
        }

        const recipe = await prisma.recipe.create({
            data: {
                title,
                description,
                country,
                prepTime: parseInt(prepTime),
                cookTime: parseInt(cookTime),
                servings: parseInt(servings),
                difficulty,
                type,
                diet: parsedDiet,
                instructions,
                imageUrl,
                status,
                isPublished,
                authorId: req.user.id,
                ingredients: {
                    create: parsedIngredients.map(ing => ({
                        name: ing.name,
                        quantity: ing.quantity,
                        unit: ing.unit,
                    })),
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                ingredients: true,
            },
        });

        const message = (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')
            ? 'Recipe created and published successfully'
            : 'Recipe submitted for review';

        res.status(201).json({
            message,
            recipe,
        });
    } catch (error) {
        console.error('Create recipe error:', error);

        if (req.file) {
            deleteImage(`/uploads/${req.file.filename}`);
        }

        if (error.message === 'INVALID_INGREDIENTS') {
            return res.status(400).json({ error: 'Ingredients payload is invalid' });
        }

        if (error.message === 'INVALID_DIET') {
            return res.status(400).json({ error: 'Diet payload is invalid' });
        }

        res.status(500).json({ error: 'Failed to create recipe' });
    }
};

export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            country,
            prepTime,
            cookTime,
            servings,
            difficulty,
            type,
            diet,
            instructions,
            ingredients,
        } = req.body;

        const existingRecipe = await prisma.recipe.findUnique({
            where: { id },
            include: { ingredients: true },
        });

        if (!existingRecipe) {
            return sendError(res, 404, 'Recipe not found', 'RECIPE_NOT_FOUND');
        }

        if (existingRecipe.authorId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Not authorized to update this recipe' });
        }

        const parsedIngredients = parseIngredientsInput(ingredients);
        const parsedDiet = parseDietInput(diet);

        let imageUrl = existingRecipe.imageUrl;
        if (req.file) {
            if (existingRecipe.imageUrl) {
                deleteImage(existingRecipe.imageUrl);
            }
            imageUrl = `/uploads/${req.file.filename}`;
        }

        let newStatus = existingRecipe.status;
        let isPublished = existingRecipe.isPublished;

        if (existingRecipe.status === 'REJECTED' && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            newStatus = 'PENDING';
            isPublished = false;
        }

        const recipe = await prisma.recipe.update({
            where: { id },
            data: {
                title,
                description,
                country,
                prepTime: parseInt(prepTime),
                cookTime: parseInt(cookTime),
                servings: parseInt(servings),
                difficulty,
                type,
                diet: parsedDiet,
                instructions,
                imageUrl,
                status: newStatus,
                isPublished,
                moderationNote: newStatus === 'PENDING' ? null : existingRecipe.moderationNote,
                ingredients: {
                    deleteMany: {},
                    create: parsedIngredients.map(ing => ({
                        name: ing.name,
                        quantity: ing.quantity,
                        unit: ing.unit,
                    })),
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                ingredients: true,
            },
        });

        res.json({
            message: newStatus === 'PENDING'
                ? 'Recipe updated and resubmitted for review'
                : 'Recipe updated successfully',
            recipe,
        });
    } catch (error) {
        console.error('Update recipe error:', error);

        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'Recipe not found or already deleted', 'RECIPE_NOT_FOUND');
        }

        if (error.message === 'INVALID_INGREDIENTS') {
            return res.status(400).json({ error: 'Ingredients payload is invalid' });
        }

        if (error.message === 'INVALID_DIET') {
            return res.status(400).json({ error: 'Diet payload is invalid' });
        }

        res.status(500).json({ error: 'Failed to update recipe' });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;

        const recipe = await prisma.recipe.findUnique({
            where: { id },
        });

        if (!recipe) {
            return sendError(res, 404, 'Recipe not found', 'RECIPE_NOT_FOUND');
        }

        if (recipe.authorId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Not authorized to delete this recipe' });
        }

        if (recipe.imageUrl) {
            deleteImage(recipe.imageUrl);
        }

        await prisma.recipe.delete({
            where: { id },
        });

        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error('Delete recipe error:', error);
        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'Recipe already deleted by another admin', 'RECIPE_ALREADY_DELETED');
        }
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
};

export const getRecipeFilters = async (req, res) => {
    try {
        const [countries, types, ingredients, diets] = await Promise.all([
            prisma.recipe.findMany({
                where: { status: 'APPROVED', isPublished: true },
                select: { country: true },
                distinct: ['country'],
                orderBy: { country: 'asc' }
            }),
            prisma.recipe.findMany({
                where: { status: 'APPROVED', isPublished: true },
                select: { type: true },
                distinct: ['type']
            }),
            prisma.ingredient.findMany({
                select: { name: true },
                distinct: ['name'],
                orderBy: { name: 'asc' }
            }),
            prisma.recipe.findMany({
                where: { status: 'APPROVED', isPublished: true },
                select: { diet: true }
            })
        ]);

        const uniqueDiets = [...new Set(diets.flatMap(r => r.diet))];

        res.json({
            countries: countries.map(c => c.country),
            types: types.map(t => t.type),
            ingredients: ingredients.map(i => i.name),
            diets: uniqueDiets.sort()
        });
    } catch (error) {
        console.error('Get filters error:', error);
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
};

export const rateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { score } = req.body;

        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ error: 'Score must be between 1 and 5' });
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id },
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        await prisma.rating.upsert({
            where: {
                userId_recipeId: {
                    userId: req.user.id,
                    recipeId: id,
                },
            },
            update: {
                score: parseInt(score),
            },
            create: {
                userId: req.user.id,
                recipeId: id,
                score: parseInt(score),
            },
        });

        // Recalculate average rating
        const ratings = await prisma.rating.findMany({
            where: { recipeId: id },
            select: { score: true },
        });

        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;

        res.json({
            message: 'Rating submitted successfully',
            averageRating: Math.round(averageRating * 10) / 10,
            ratingsCount: ratings.length,
        });
    } catch (error) {
        console.error('Rate recipe error:', error);
        res.status(500).json({ error: 'Failed to rate recipe' });
    }
};

export const addToFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        const recipe = await prisma.recipe.findUnique({
            where: { id },
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        await prisma.favorite.upsert({
            where: {
                userId_recipeId: {
                    userId: req.user.id,
                    recipeId: id,
                },
            },
            update: {},
            create: {
                userId: req.user.id,
                recipeId: id,
            },
        });

        res.json({ message: 'Recipe added to favorites' });
    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ error: 'Failed to add to favorites' });
    }
};

export const removeFromFavorites = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.favorite.deleteMany({
            where: {
                userId: req.user.id,
                recipeId: id,
            },
        });

        res.json({ message: 'Recipe removed from favorites' });
    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({ error: 'Failed to remove from favorites' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        if (content.trim().length > 1000) {
            return res.status(400).json({ error: 'Comment must not exceed 1000 characters' });
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id },
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                userId: req.user.id,
                recipeId: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: 'Comment added successfully',
            comment,
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user is the comment author or has moderator/admin role
        if (comment.userId !== req.user.id && req.user.role !== 'MODERATOR' && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id: commentId },
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'Comment not found or already deleted', 'COMMENT_NOT_FOUND');
        }
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};
