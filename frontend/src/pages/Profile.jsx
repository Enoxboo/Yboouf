import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusLabel = {
    DRAFT: 'Brouillon',
    PENDING: 'En attente',
    APPROVED: 'Approuvee',
    REJECTED: 'Rejetee',
};

const statusBadgeClass = {
    DRAFT: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(false);
    const [favoritesError, setFavoritesError] = useState(null);
    const [favoritesPage, setFavoritesPage] = useState(1);
    const [favoritesPagination, setFavoritesPagination] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                setProfile(response.data?.user || null);
            } catch {
                setError('Erreur lors du chargement du profil.');
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [recipesRes, statsRes] = await Promise.all([
                    api.get('/users/recipes', {
                        params: {
                            page,
                            limit: 8,
                            status: statusFilter || undefined,
                        }
                    }),
                    api.get('/users/stats'),
                ]);

                setRecipes(recipesRes.data?.recipes || []);
                setPagination(recipesRes.data?.pagination || null);
                setStats(statsRes.data?.stats || null);
            } catch {
                setError('Erreur lors du chargement de vos recettes.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipes();
    }, [page, statusFilter]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                setFavoritesLoading(true);
                setFavoritesError(null);

                const response = await api.get('/users/favorites', {
                    params: {
                        page: favoritesPage,
                        limit: 8,
                    }
                });

                setFavorites(response.data?.recipes || []);
                setFavoritesPagination(response.data?.pagination || null);
            } catch {
                setFavoritesError('Erreur lors du chargement de vos favoris.');
            } finally {
                setFavoritesLoading(false);
            }
        };

        fetchFavorites();
    }, [favoritesPage]);

    if (isLoading && !profile) {
        return <p className="text-sm">Chargement du profil...</p>;
    }

    if (error && !profile) {
        return <p className="text-sm text-red-600">{error}</p>;
    }

    const username = profile?.username || 'Utilisateur';

    return (
        <section className="mx-auto max-w-7xl px-1 sm:px-2">
            <div className="mb-6 rounded-2xl bg-linear-to-r from-[#095d63] to-white px-4 py-5 shadow-md dark:from-primary dark:to-secondary">
                <h1 className="hero-text text-2xl font-bold sm:text-3xl">Bonjour, {username}</h1>
                <p className="hero-text mt-2 text-sm sm:text-base">Voici vos recettes envoyees et leur statut de moderation.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                    <div className="card rounded-2xl">
                        <h2 className="mb-4 text-lg font-semibold sm:text-xl">Informations</h2>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500">Pseudo</p>
                                <p className="font-medium">{profile?.username}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Email</p>
                                <p className="font-medium">{profile?.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Role</p>
                                <p className="font-medium">{profile?.role}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Inscription</p>
                                <p className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card rounded-2xl">
                        <h2 className="mb-4 text-lg font-semibold sm:text-xl">Activite</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="stat-card">
                                <p className="text-xs uppercase tracking-wide text-black">Total</p>
                                <p className="mt-2 text-2xl font-bold">{stats?.total ?? 0}</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-xs uppercase tracking-wide text-black">En attente</p>
                                <p className="mt-2 text-2xl font-bold">{stats?.pending ?? 0}</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-xs uppercase tracking-wide text-black">Approuvees</p>
                                <p className="mt-2 text-2xl font-bold">{stats?.approved ?? 0}</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-xs uppercase tracking-wide text-black">Rejetees</p>
                                <p className="mt-2 text-2xl font-bold">{stats?.rejected ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-2">
                    <div className="card rounded-2xl">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold sm:text-xl">Mes recettes</h2>
                            <select
                                value={statusFilter}
                                onChange={(event) => {
                                    setStatusFilter(event.target.value);
                                    setPage(1);
                                }}
                                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="PENDING">En attente</option>
                                <option value="APPROVED">Approuvees</option>
                                <option value="REJECTED">Rejetees</option>
                                <option value="DRAFT">Brouillons</option>
                            </select>
                        </div>

                        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

                        {isLoading ? (
                            <p className="text-sm">Chargement des recettes...</p>
                        ) : recipes.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucune recette pour ce filtre.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {recipes.map((recipe) => (
                                    <article key={recipe.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-semibold">{recipe.title}</p>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[recipe.status] || statusBadgeClass.DRAFT}`}>
                                                {statusLabel[recipe.status] || recipe.status}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{recipe.country} - {recipe.type}</p>
                                        {recipe.status === 'REJECTED' && recipe.moderationNote && (
                                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
                                                <p className="font-semibold">Raison du rejet</p>
                                                <p>{recipe.moderationNote}</p>
                                                <p className="mt-2 text-xs">Corrige la recette puis re-soumets-la via "Ajouter une recette".</p>
                                            </div>
                                        )}
                                        <div className="mt-3">
                                            <Link to={`/recipe/${recipe.id}`} className="text-sm font-medium text-primary hover:underline">
                                                Voir la recette
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {pagination?.pages > 1 && (
                            <div className="mt-5 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setPage((prev) => prev - 1)}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Precedent
                                </button>
                                <span className="text-xs text-gray-500">
                                    Page {pagination.page} / {pagination.pages}
                                </span>
                                <button
                                    type="button"
                                    disabled={page >= pagination.pages}
                                    onClick={() => setPage((prev) => prev + 1)}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="card rounded-2xl">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-semibold sm:text-xl">Mes favoris</h2>
                        </div>

                        {favoritesError && <p className="mb-3 text-sm text-red-600">{favoritesError}</p>}

                        {favoritesLoading ? (
                            <p className="text-sm">Chargement des favoris...</p>
                        ) : favorites.length === 0 ? (
                            <p className="text-sm text-gray-500">Aucun favori trouve.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {favorites.map((favorite) => (
                                    <article key={favorite.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-semibold">{favorite.title}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">{favorite.country} - {favorite.type}</p>
                                        <div className="mt-3">
                                            <Link to={`/recipe/${favorite.id}`} className="text-sm font-medium text-primary hover:underline">
                                                Voir la recette
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {favoritesPagination?.pages > 1 && (
                            <div className="mt-5 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    disabled={favoritesPage <= 1}
                                    onClick={() => setFavoritesPage((prev) => prev - 1)}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Precedent
                                </button>
                                <span className="text-xs text-gray-500">
                                    Page {favoritesPagination.page} / {favoritesPagination.pages}
                                </span>
                                <button
                                    type="button"
                                    disabled={favoritesPage >= favoritesPagination.pages}
                                    onClick={() => setFavoritesPage((prev) => prev + 1)}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;
