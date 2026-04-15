import prisma from '../services/prisma.service.js';
import { isPrismaKnownRequestError, isPrismaNotFoundError, sendError } from '../utils/helpers.js';

const MANAGEABLE_ROLES = ['USER', 'MODERATOR', 'ADMIN'];

const parsePagination = (page = 1, limit = 20) => {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    return {
        page: safePage,
        limit: safeLimit,
        skip: (safePage - 1) * safeLimit,
    };
};

export const getPendingRecipes = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pagination = parsePagination(page, limit);

        const [recipes, total] = await Promise.all([
            prisma.recipe.findMany({
                where: {
                    status: 'PENDING'
                },
                skip: pagination.skip,
                take: pagination.limit,
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
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
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
        const pagination = parsePagination(page, limit);

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
                skip: pagination.skip,
                take: pagination.limit,
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
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
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
            return sendError(res, 404, 'Recipe not found', 'RECIPE_NOT_FOUND');
        }

        if (recipe.status === 'APPROVED') {
            return sendError(res, 409, 'Recipe is already approved', 'RECIPE_ALREADY_APPROVED');
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
        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'Recipe not found or already deleted', 'RECIPE_NOT_FOUND');
        }
        if (isPrismaKnownRequestError(error)) {
            return sendError(res, 400, 'Invalid recipe update request', 'INVALID_RECIPE_UPDATE');
        }
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
            return sendError(res, 404, 'Recipe not found', 'RECIPE_NOT_FOUND');
        }

        if (recipe.status === 'REJECTED') {
            return sendError(res, 409, 'Recipe is already rejected', 'RECIPE_ALREADY_REJECTED');
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
        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'Recipe not found or already deleted', 'RECIPE_NOT_FOUND');
        }
        if (isPrismaKnownRequestError(error)) {
            return sendError(res, 400, 'Invalid recipe update request', 'INVALID_RECIPE_UPDATE');
        }
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

export const getUserModerationStats = async (req, res) => {
    try {
        const [total, users, moderators, admins, superAdmins] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'USER' } }),
            prisma.user.count({ where: { role: 'MODERATOR' } }),
            prisma.user.count({ where: { role: 'ADMIN' } }),
            prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
        ]);

        res.json({
            stats: {
                total,
                users,
                moderators,
                admins,
                superAdmins,
            }
        });
    } catch (error) {
        console.error('Get user moderation stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

export const getRecipeByIdAdmin = async (req, res) => {
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

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.json({ recipe });
    } catch (error) {
        console.error('Get admin recipe by id error:', error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
};

export const getUsersForModeration = async (req, res) => {
    try {
        const {
            role,
            createdFrom,
            createdTo,
            search,
            page = 1,
            limit = 12,
        } = req.query;

        const pagination = parsePagination(page, limit);
        const where = {};

        if (role && ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (createdFrom || createdTo) {
            where.createdAt = {};
            if (createdFrom) {
                where.createdAt.gte = new Date(createdFrom);
            }
            if (createdTo) {
                const endDate = new Date(createdTo);
                endDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDate;
            }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: {
                            recipes: true,
                            comments: true,
                            favorites: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            users,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit),
            }
        });
    } catch (error) {
        console.error('Get users moderation error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const promoteUserToModerator = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                role: true,
            }
        });

        if (!user) {
            return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
        }

        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Cannot update this role with this endpoint' });
        }

        if (user.role === 'MODERATOR') {
            return sendError(res, 409, 'User is already moderator', 'USER_ALREADY_MODERATOR');
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role: 'MODERATOR',
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        res.json({
            message: 'Utilisateur promu moderateur',
            user: updatedUser,
        });
    } catch (error) {
        console.error('Promote user error:', error);
        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'User not found or already deleted', 'USER_NOT_FOUND');
        }
        res.status(500).json({ error: 'Failed to promote user' });
    }
};

export const setUserRoleBySuperAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!MANAGEABLE_ROLES.includes(role)) {
            return res.status(400).json({ error: 'Invalid target role' });
        }

        if (id === req.user.id) {
            return res.status(403).json({ error: 'Cannot change your own role' });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                role: true,
                username: true,
                email: true,
                createdAt: true,
            }
        });

        if (!targetUser) {
            return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
        }

        if (targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Cannot change super admin role' });
        }

        if (targetUser.role === role) {
            return sendError(res, 409, 'User already has this role', 'USER_ROLE_ALREADY_SET');
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });

        res.json({
            message: `Role utilisateur mis a jour vers ${role}`,
            user: updatedUser,
        });
    } catch (error) {
        console.error('Set user role error:', error);
        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'User not found or already deleted', 'USER_NOT_FOUND');
        }
        res.status(500).json({ error: 'Failed to update user role' });
    }
};

export const deleteUserAccount = async (req, res) => {
    try {
        const { id } = req.params;

        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                role: true,
            }
        });

        if (!targetUser) {
            return sendError(res, 404, 'User not found', 'USER_NOT_FOUND');
        }

        if (targetUser.role === 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Cannot delete super admin account' });
        }

        if (targetUser.role === 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ error: 'Cannot delete admin account' });
        }

        if (targetUser.id === req.user.id) {
            return res.status(403).json({ error: 'Cannot delete your own account from dashboard' });
        }

        if (req.user.role === 'MODERATOR' && targetUser.role !== 'USER') {
            return res.status(403).json({ error: 'Moderator can only delete user accounts' });
        }

        await prisma.user.delete({
            where: { id },
        });

        res.json({ message: 'Compte utilisateur supprime definitivement' });
    } catch (error) {
        console.error('Delete user account error:', error);
        if (isPrismaNotFoundError(error)) {
            return sendError(res, 404, 'User already deleted by another admin', 'USER_ALREADY_DELETED');
        }
        res.status(500).json({ error: 'Failed to delete user account' });
    }
};
