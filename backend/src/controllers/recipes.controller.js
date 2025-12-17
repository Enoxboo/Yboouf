import prisma from '../services/prisma.service.js';
import { deleteImage } from '../middlewares/upload.middleware.js';

export const getAllRecipes = async (req, res) => {
    try {
        const { search, country, type, diet, page = 1, limit = 12 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
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

        const parsedIngredients = typeof ingredients === 'string'
            ? JSON.parse(ingredients)
            : ingredients;

        const parsedDiet = typeof diet === 'string'
            ? (diet.includes(',') ? diet.split(',') : [diet])
            : diet || [];

        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

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

        res.status(201).json({
            message: 'Recipe created successfully',
            recipe,
        });
    } catch (error) {
        console.error('Create recipe error:', error);

        // Supprime l'image si erreur
        if (req.file) {
            deleteImage(`/uploads/${req.file.filename}`);
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
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (existingRecipe.authorId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Not authorized to update this recipe' });
        }

        const parsedIngredients = typeof ingredients === 'string'
            ? JSON.parse(ingredients)
            : ingredients;

        const parsedDiet = typeof diet === 'string'
            ? (diet.includes(',') ? diet.split(',') : [diet])
            : diet;

        let imageUrl = existingRecipe.imageUrl;
        if (req.file) {
            if (existingRecipe.imageUrl) {
                deleteImage(existingRecipe.imageUrl);
            }
            imageUrl = `/uploads/${req.file.filename}`;
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
            message: 'Recipe updated successfully',
            recipe,
        });
    } catch (error) {
        console.error('Update recipe error:', error);
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
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (recipe.authorId !== req.user.id && req.user.role !== 'ADMIN') {
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
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
};

export const getRecipeFilters = async (req, res) => {
    try {
        const [countries, types] = await Promise.all([
            prisma.recipe.findMany({
                where: { isPublished: true },
                select: { country: true },
                distinct: ['country'],
                orderBy: { country: 'asc' }
            }),
            prisma.recipe.findMany({
                where: { isPublished: true },
                select: { type: true },
                distinct: ['type']
            })
        ]);

        res.json({
            countries: countries.map(c => c.country),
            types: types.map(t => t.type)
        });
    } catch (error) {
        console.error('Get filters error:', error);
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
};
