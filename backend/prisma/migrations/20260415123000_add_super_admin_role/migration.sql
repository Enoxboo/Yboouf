-- Add founder role with highest privileges
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

