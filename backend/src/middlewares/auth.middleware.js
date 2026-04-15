import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.service.js';

const ROLE_LEVELS = {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2,
    SUPER_ADMIN: 3,
};

const hasRoleAtLeast = (currentRole, minimumRole) => {
    const currentLevel = ROLE_LEVELS[currentRole] ?? -1;
    const minimumLevel = ROLE_LEVELS[minimumRole] ?? Number.MAX_SAFE_INTEGER;
    return currentLevel >= minimumLevel;
};

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (!hasRoleAtLeast(req.user.role, 'ADMIN')) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

export const requireModerator = (req, res, next) => {
    if (!hasRoleAtLeast(req.user.role, 'MODERATOR')) {
        return res.status(403).json({ error: 'Moderator or Admin access required' });
    }
    next();
};

export const requireSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                },
            });

            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Ignore
    }
    next();
};