import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Users, ChefHat, Trash2, ArrowUpCircle, Search, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
    useAdminUsers,
    useAdminUserStats,
    usePromoteUser,
    useSetUserRole,
    useDeleteUser,
    useAdminRecipes,
    usePendingRecipes,
    useAdminRecipeStats,
    useApproveRecipe,
    useRejectRecipe,
} from '../hooks/useAdmin';
import { recipeService } from '../services/recipeService';

const inputClass =
    'w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white';

const PaginationControls = ({ page, pages, onPageChange }) => {
    if (!pages || pages <= 1) {
        return null;
    }

    const start = Math.max(1, page - 1);
    const end = Math.min(pages, start + 2);
    const pageItems = [];
    for (let current = start; current <= end; current += 1) {
        pageItems.push(current);
    }

    return (
        <div className="mt-4 flex items-center justify-between gap-2">
            <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="btn-secondary text-sm disabled:opacity-50"
            >
                Precedent
            </button>
            <div className="flex items-center gap-2">
                {pageItems.map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onPageChange(item)}
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm ${
                            item === page ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white'
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>
            <button
                type="button"
                disabled={page >= pages}
                onClick={() => onPageChange(page + 1)}
                className="btn-secondary text-sm disabled:opacity-50"
            >
                Suivant
            </button>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const isAdmin = user?.role === 'ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const canModerateRecipes = isAdmin || isSuperAdmin;

    const [userFilters, setUserFilters] = useState({
        search: '',
        role: '',
        createdFrom: '',
        createdTo: '',
        page: 1,
        limit: 8,
    });

    const [recipeFilters, setRecipeFilters] = useState({
        search: '',
        status: '',
        page: 1,
        limit: 6,
    });

    const usersQuery = useAdminUsers(userFilters);
    const userStatsQuery = useAdminUserStats();

    const recipesQuery = useAdminRecipes(recipeFilters);
    const pendingRecipesQuery = usePendingRecipes({ page: 1, limit: 6 });
    const recipeStatsQuery = useAdminRecipeStats();

    const promoteUser = usePromoteUser();
    const setUserRole = useSetUserRole();
    const deleteUser = useDeleteUser();
    const approveRecipe = useApproveRecipe();
    const rejectRecipe = useRejectRecipe();

    const deleteRecipe = useMutation({
        mutationFn: recipeService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-pending-recipes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-recipe-stats'] });
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
            toast.success('Recette supprimee definitivement');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.error || 'Impossible de supprimer la recette');
        },
    });

    const users = usersQuery.data?.users || [];
    const usersPagination = usersQuery.data?.pagination;
    const userStats = userStatsQuery.data?.stats;

    const recipes = recipesQuery.data?.recipes || [];
    const recipesPagination = recipesQuery.data?.pagination;
    const pendingRecipes = pendingRecipesQuery.data?.recipes || [];
    const recipeStats = recipeStatsQuery.data?.stats;

    const userLoading = usersQuery.isLoading || userStatsQuery.isLoading;
    const recipeLoading = recipesQuery.isLoading || pendingRecipesQuery.isLoading || recipeStatsQuery.isLoading;

    const roleLabel = useMemo(() => {
        if (user?.role === 'SUPER_ADMIN') return 'Fondateur';
        if (user?.role === 'ADMIN') return 'Admin';
        if (user?.role === 'MODERATOR') return 'Moderateur';
        return 'Utilisateur';
    }, [user?.role]);

    const getRoleLabel = (role) => {
        if (role === 'SUPER_ADMIN') return 'Fondateur';
        if (role === 'ADMIN') return 'Admin';
        if (role === 'MODERATOR') return 'Moderateur';
        return 'Utilisateur';
    };

    const onPromoteUser = async (targetUser) => {
        try {
            await promoteUser.mutateAsync(targetUser.id);
            toast.success(`${targetUser.username} est maintenant moderateur`);
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Promotion impossible');
        }
    };

    const onDeleteUser = async (targetUser) => {
        const confirmed = window.confirm(`Supprimer definitivement le compte ${targetUser.username} ?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteUser.mutateAsync(targetUser.id);
            toast.success('Compte supprime definitivement');
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Suppression impossible');
        }
    };

    const onSetUserRole = async (targetUser, nextRole) => {
        const confirmed = window.confirm(`Changer le role de ${targetUser.username} vers ${getRoleLabel(nextRole)} ?`);
        if (!confirmed) {
            return;
        }

        try {
            await setUserRole.mutateAsync({ id: targetUser.id, role: nextRole });
            toast.success(`${targetUser.username} est maintenant ${getRoleLabel(nextRole).toLowerCase()}`);
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Mise a jour du role impossible');
        }
    };

    const onApproveRecipe = async (recipe) => {
        const note = window.prompt('Note de moderation (optionnelle):', '');
        try {
            await approveRecipe.mutateAsync({ id: recipe.id, note: note || undefined });
            toast.success('Recette approuvee');
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Validation impossible');
        }
    };

    const onRejectRecipe = async (recipe) => {
        const reason = window.prompt('Raison du rejet (10 caracteres min):', 'Recette incomplete a corriger');
        if (!reason) {
            return;
        }

        try {
            await rejectRecipe.mutateAsync({ id: recipe.id, reason });
            toast.success('Recette rejetee avec raison');
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Rejet impossible');
        }
    };

    return (
        <section className="mx-auto max-w-7xl px-1 sm:px-2">
            <div className="mb-6 rounded-2xl bg-linear-to-r from-[#095d63] to-white px-4 py-5 shadow-md dark:from-primary dark:to-secondary">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="hero-text text-2xl font-bold sm:text-3xl">Dashboard moderation</h1>
                        <p className="hero-text mt-1 text-sm sm:text-base">Connecte en tant que {roleLabel}. Gestion cas par cas, mobile first.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                        <Shield size={14} />
                        {roleLabel}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="card rounded-2xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Users size={18} className="text-primary" />
                        <h2 className="text-lg font-semibold sm:text-xl">Moderation utilisateurs</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="stat-card">
                            <p className="text-xs uppercase tracking-wide text-black">Total</p>
                            <p className="mt-2 text-2xl font-bold">{userStats?.total ?? 0}</p>
                        </div>
                        <div className="stat-card">
                            <p className="text-xs uppercase tracking-wide text-black">Utilisateurs</p>
                            <p className="mt-2 text-2xl font-bold">{userStats?.users ?? 0}</p>
                        </div>
                        <div className="stat-card">
                            <p className="text-xs uppercase tracking-wide text-black">Moderateurs</p>
                            <p className="mt-2 text-2xl font-bold">{userStats?.moderators ?? 0}</p>
                        </div>
                        <div className="stat-card">
                            <p className="text-xs uppercase tracking-wide text-black">Admins</p>
                            <p className="mt-2 text-2xl font-bold">{userStats?.admins ?? 0}</p>
                        </div>
                        <div className="stat-card">
                            <p className="text-xs uppercase tracking-wide text-black">Fondateurs</p>
                            <p className="mt-2 text-2xl font-bold">{userStats?.superAdmins ?? 0}</p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                        <div className="lg:col-span-2">
                            <label className="mb-1 block text-xs font-semibold">Recherche</label>
                            <div className="relative">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    value={userFilters.search}
                                    onChange={(event) => setUserFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
                                    className={`${inputClass} pl-9`}
                                    placeholder="Pseudo ou email"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold">Role</label>
                            <select
                                value={userFilters.role}
                                onChange={(event) => setUserFilters((prev) => ({ ...prev, role: event.target.value, page: 1 }))}
                                className={inputClass}
                            >
                                <option value="">Tous</option>
                                <option value="USER">Utilisateur</option>
                                <option value="MODERATOR">Moderateur</option>
                                <option value="ADMIN">Admin</option>
                                <option value="SUPER_ADMIN">Fondateur</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold">Inscrit depuis</label>
                            <input
                                type="date"
                                value={userFilters.createdFrom}
                                onChange={(event) => setUserFilters((prev) => ({ ...prev, createdFrom: event.target.value, page: 1 }))}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold">Inscrit jusqu'au</label>
                            <input
                                type="date"
                                value={userFilters.createdTo}
                                onChange={(event) => setUserFilters((prev) => ({ ...prev, createdTo: event.target.value, page: 1 }))}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {userLoading ? (
                        <p className="mt-5 text-sm">Chargement des utilisateurs...</p>
                    ) : users.length === 0 ? (
                        <p className="mt-5 text-sm text-gray-500">Aucun utilisateur trouve avec ces filtres.</p>
                    ) : (
                        <div className="mt-5 grid grid-cols-1 gap-3">
                            {users.map((item) => (
                                <article key={item.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">{item.username}</p>
                                            <p className="text-sm text-gray-500">{item.email}</p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Role: {getRoleLabel(item.role)} - Inscription: {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Recettes: {item._count.recipes} - Commentaires: {item._count.comments}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {(isAdmin || isSuperAdmin) && item.role === 'USER' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onPromoteUser(item)}
                                                    disabled={promoteUser.isPending}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    <ArrowUpCircle size={14} />
                                                    Promouvoir moderateur
                                                </button>
                                            )}

                                            {isSuperAdmin && item.role === 'MODERATOR' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onSetUserRole(item, 'ADMIN')}
                                                    disabled={setUserRole.isPending}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                                                >
                                                    <ArrowUpCircle size={14} />
                                                    Promouvoir admin
                                                </button>
                                            )}

                                            {isSuperAdmin && item.role === 'ADMIN' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onSetUserRole(item, 'MODERATOR')}
                                                    disabled={setUserRole.isPending}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                                                >
                                                    <ArrowUpCircle size={14} />
                                                    Retrograder moderateur
                                                </button>
                                            )}

                                            {isSuperAdmin && item.role === 'MODERATOR' && (
                                                <button
                                                    type="button"
                                                    onClick={() => onSetUserRole(item, 'USER')}
                                                    disabled={setUserRole.isPending}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-gray-600 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                                >
                                                    <ArrowUpCircle size={14} />
                                                    Retrograder utilisateur
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => onDeleteUser(item)}
                                                disabled={deleteUser.isPending || item.role === 'SUPER_ADMIN' || item.id === user?.id}
                                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                <Trash2 size={14} />
                                                {item.role === 'SUPER_ADMIN' ? 'Protege' : 'Supprimer'}
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    <PaginationControls
                        page={usersPagination?.page || 1}
                        pages={usersPagination?.pages || 1}
                        onPageChange={(nextPage) => setUserFilters((prev) => ({ ...prev, page: nextPage }))}
                    />
                </div>

                {canModerateRecipes && (
                    <>
                        <div className="card rounded-2xl">
                            <div className="mb-4 flex items-center gap-2">
                                <ChefHat size={18} className="text-primary" />
                                <h2 className="text-lg font-semibold sm:text-xl">Recettes en attente</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="stat-card">
                                    <p className="text-xs uppercase tracking-wide text-black">En attente</p>
                                    <p className="mt-2 text-2xl font-bold">{recipeStats?.pending ?? 0}</p>
                                </div>
                                <div className="stat-card">
                                    <p className="text-xs uppercase tracking-wide text-black">Approuvees</p>
                                    <p className="mt-2 text-2xl font-bold">{recipeStats?.approved ?? 0}</p>
                                </div>
                                <div className="stat-card">
                                    <p className="text-xs uppercase tracking-wide text-black">Rejetees</p>
                                    <p className="mt-2 text-2xl font-bold">{recipeStats?.rejected ?? 0}</p>
                                </div>
                                <div className="stat-card">
                                    <p className="text-xs uppercase tracking-wide text-black">Total</p>
                                    <p className="mt-2 text-2xl font-bold">{recipeStats?.total ?? 0}</p>
                                </div>
                            </div>

                            {recipeLoading ? (
                                <p className="mt-4 text-sm">Chargement des recettes en attente...</p>
                            ) : pendingRecipes.length === 0 ? (
                                <p className="mt-4 text-sm text-gray-500">Aucune recette en attente.</p>
                            ) : (
                                <div className="mt-5 grid grid-cols-1 gap-3">
                                    {pendingRecipes.map((recipe) => (
                                        <article key={recipe.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">{recipe.title}</p>
                                                    <p className="text-sm text-gray-500">Par {recipe.author?.username} - {recipe.country}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{recipe.description}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => onApproveRecipe(recipe)}
                                                        disabled={approveRecipe.isPending}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Approuver
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onRejectRecipe(recipe)}
                                                        disabled={rejectRecipe.isPending}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                                                    >
                                                        <XCircle size={14} />
                                                        Rejeter
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="card rounded-2xl">
                            <div className="mb-4 flex items-center gap-2">
                                <ChefHat size={18} className="text-primary" />
                                <h2 className="text-lg font-semibold sm:text-xl">Gestion des recettes</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-xs font-semibold">Recherche recette</label>
                                    <input
                                        value={recipeFilters.search}
                                        onChange={(event) => setRecipeFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
                                        className={inputClass}
                                        placeholder="Titre ou auteur"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold">Statut</label>
                                    <select
                                        value={recipeFilters.status}
                                        onChange={(event) => setRecipeFilters((prev) => ({ ...prev, status: event.target.value, page: 1 }))}
                                        className={inputClass}
                                    >
                                        <option value="">Tous</option>
                                        <option value="PENDING">En attente</option>
                                        <option value="APPROVED">Approuvee</option>
                                        <option value="REJECTED">Rejetee</option>
                                        <option value="DRAFT">Brouillon</option>
                                    </select>
                                </div>
                            </div>

                            {recipesQuery.isLoading ? (
                                <p className="mt-4 text-sm">Chargement des recettes...</p>
                            ) : recipes.length === 0 ? (
                                <p className="mt-4 text-sm text-gray-500">Aucune recette trouvee.</p>
                            ) : (
                                <div className="mt-5 grid grid-cols-1 gap-3">
                                    {recipes.map((recipe) => (
                                        <article key={recipe.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold">{recipe.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {recipe.author?.username} - {recipe.country} - {recipe.status}
                                                    </p>
                                                    {recipe.moderationNote && (
                                                        <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Motif: {recipe.moderationNote}</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    <Link
                                                        to={`/dashboard/recipes/${recipe.id}/edit`}
                                                        className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                                                    >
                                                        Modifier
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const ok = window.confirm('Supprimer definitivement cette recette ?');
                                                            if (ok) {
                                                                deleteRecipe.mutate(recipe.id);
                                                            }
                                                        }}
                                                        disabled={deleteRecipe.isPending}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={14} />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}

                            <PaginationControls
                                page={recipesPagination?.page || 1}
                                pages={recipesPagination?.pages || 1}
                                onPageChange={(nextPage) => setRecipeFilters((prev) => ({ ...prev, page: nextPage }))}
                            />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Dashboard;


