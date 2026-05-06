import prisma from '../services/prisma.service.js';

export const getMyRecipes = async (req, res) => {
    try {
        const { status, page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            authorId: req.user.id
        };

        if (status) {
            where.status = status;
        }

        const [recipes, total] = await Promise.all([
            prisma.recipe.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    ingredients: true,
                    moderatedBy: {
                        select: {
                            id: true,
                            username: true,
                        }
                    },
                    _count: {
                        select: {
                            favorites: true,
                            ratings: true,
                            comments: true,
                        }
                    },
                    ratings: {
                        select: {
                            score: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.recipe.count({ where })
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
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get my recipes error:', error);
        res.status(500).json({ error: 'Failed to fetch your recipes' });
    }
};

export const getMyStats = async (req, res) => {
    try {
        const [pending, approved, rejected, draft, total] = await Promise.all([
            prisma.recipe.count({
                where: {
                    authorId: req.user.id,
                    status: 'PENDING'
                }
            }),
            prisma.recipe.count({
                where: {
                    authorId: req.user.id,
                    status: 'APPROVED'
                }
            }),
            prisma.recipe.count({
                where: {
                    authorId: req.user.id,
                    status: 'REJECTED'
                }
            }),
            prisma.recipe.count({
                where: {
                    authorId: req.user.id,
                    status: 'DRAFT'
                }
            }),
            prisma.recipe.count({
                where: {
                    authorId: req.user.id
                }
            })
        ]);

        res.json({
            stats: {
                pending,
                approved,
                rejected,
                draft,
                total
            }
        });
    } catch (error) {
        console.error('Get my stats error:', error);
        res.status(500).json({ error: 'Failed to fetch your stats' });
    }
};

export const getMyFavorites = async (req, res) => {
    try {
        const { page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            userId: req.user.id,
            recipe: {
                status: 'APPROVED',
                isPublished: true,
            },
        };

        const [favorites, total] = await Promise.all([
            prisma.favorite.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    recipe: {
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
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.favorite.count({ where }),
        ]);

        const recipes = favorites.map(fav => {
            const recipe = fav.recipe;
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
            recipes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get my favorites error:', error);
        res.status(500).json({ error: 'Failed to fetch your favorites' });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        recipes: true,
                        favorites: true,
                        ratings: true,
                        comments: true,
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const recipeStats = await Promise.all([
            prisma.recipe.count({
                where: {
                    authorId: req.user.id,
                    status: 'APPROVED'
                }
            }),
            prisma.recipe.count({
                where: {
                    authorId: req.user.id,
                    status: 'PENDING'
                }
            }),
        ]);

        res.json({
            user: {
                ...user,
                stats: {
                    totalRecipes: user._count.recipes,
                    approvedRecipes: recipeStats[0],
                    pendingRecipes: recipeStats[1],
                    favorites: user._count.favorites,
                    ratings: user._count.ratings,
                    comments: user._count.comments,
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};