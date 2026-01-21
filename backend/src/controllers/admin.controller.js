import prisma from '../services/prisma.service.js';

export const getPendingRecipes = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [recipes, total] = await Promise.all([
            prisma.recipe.findMany({
                where: {
                    status: 'PENDING'
                },
                skip,
                take: parseInt(limit),
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        }
                    },
                    ingredients: true,
                    _count: {
                        select: {
                            favorites: true,
                            ratings: true,
                            comments: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }),
            prisma.recipe.count({
                where: {
                    status: 'PENDING'
                }
            })
        ]);

        res.json({
            recipes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get pending recipes error:', error);
        res.status(500).json({ error: 'Failed to fetch pending recipes' });
    }
};

export const getAllRecipesAdmin = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { username: { contains: search, mode: 'insensitive' } } }
            ];
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
                            email: true,
                        }
                    },
                    moderatedBy: {
                        select: {
                            id: true,
                            username: true,
                        }
                    },
                    ingredients: true,
                    _count: {
                        select: {
                            favorites: true,
                            ratings: true,
                            comments: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.recipe.count({ where })
        ]);

        res.json({
            recipes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get all recipes admin error:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

export const approveRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        const recipe = await prisma.recipe.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        username: true,
                        email: true,
                    }
                }
            }
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (recipe.status === 'APPROVED') {
            return res.status(400).json({ error: 'Recipe is already approved' });
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { id },
            data: {
                status: 'APPROVED',
                isPublished: true,
                moderationNote: note || null,
                moderatedAt: new Date(),
                moderatedById: req.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                moderatedBy: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                ingredients: true,
            }
        });

        res.json({
            message: 'Recipe approved successfully',
            recipe: updatedRecipe
        });
    } catch (error) {
        console.error('Approve recipe error:', error);
        res.status(500).json({ error: 'Failed to approve recipe' });
    }
};

export const rejectRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const recipe = await prisma.recipe.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        username: true,
                        email: true,
                    }
                }
            }
        });

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        const updatedRecipe = await prisma.recipe.update({
            where: { id },
            data: {
                status: 'REJECTED',
                isPublished: false,
                moderationNote: reason,
                moderatedAt: new Date(),
                moderatedById: req.user.id,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                moderatedBy: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                ingredients: true,
            }
        });

        res.json({
            message: 'Recipe rejected',
            recipe: updatedRecipe
        });
    } catch (error) {
        console.error('Reject recipe error:', error);
        res.status(500).json({ error: 'Failed to reject recipe' });
    }
};

export const getModerationStats = async (req, res) => {
    try {
        const [pending, approved, rejected, total] = await Promise.all([
            prisma.recipe.count({ where: { status: 'PENDING' } }),
            prisma.recipe.count({ where: { status: 'APPROVED' } }),
            prisma.recipe.count({ where: { status: 'REJECTED' } }),
            prisma.recipe.count()
        ]);

        res.json({
            stats: {
                pending,
                approved,
                rejected,
                draft: total - pending - approved - rejected,
                total
            }
        });
    } catch (error) {
        console.error('Get moderation stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};