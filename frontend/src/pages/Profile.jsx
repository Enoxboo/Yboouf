import {useState, useEffect} from 'react';
import axios from 'axios';
import {useAuth} from '../context/AuthContext';
// import RecipeCard from '../components/recipe/RecipeCard';

const Profile = () => {
    const {user: authUser} = useAuth();
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('recipes');
    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const [profileRes, recipesRes, statsRes] = await Promise.all([
                    axios.get('/users/profile'),
                    axios.get('/users/recipes'),
                    axios.get('/users/stats')
                ]);
                setProfile(profileRes.data);
                setRecipes(Array.isArray(recipesRes.data) ? recipesRes.data : []);
                setStats(statsRes.data || {});
            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement du profil');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Chargement du profil...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">{error}</div>
            </div>
        );
    }

    const user = {
        name: authUser?.username || authUser?.name || profile.name || 'Utilisateur',
        email: profile.email || '',
        country: profile.country || 'Non renseigné',
        favoriteCuisine: profile.favoriteCuisine || 'Non renseigné',
        bio: profile.bio || 'Ajoutez une description à votre profil.'
    };

    const userStats = {
        recipesCount: stats?.recipesCount ?? recipes.length,
        favoritesCount: stats?.favoritesCount ?? 0,
        likesCount: stats?.likesCount ?? 0
    };

    const displayedRecipes = activeTab === 'recipes' ? recipes : [];

    return (
        <div>
            <div className="bg-linear-to-r from-[#095d63] to-white dark:from-primary dark:to-secondary rounded-lg p-12 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-black/20 flex items-center justify-center border-4 border-white shadow-md">
                        <span className="hero-text text-2xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="hero-text text-4xl font-bold mb-1">
                            Bonjour, {user.name}
                        </h1>
                        <p className="hero-text text-xl">
                            Gérez vos informations personnelles et vos recettes.
                        </p>
                    </div>
                </div>
                <div className="ml-auto flex gap-3">
                    <button
                        onClick={() => setEditing(!editing)}
                        className="px-4 py-2 rounded-xl bg-black/70 text-white text-sm font-medium hover:bg-black/90 transition-colors"
                    >
                        {editing ? 'Annuler' : 'Modifier le profil'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4">Informations</h2>
                        {!editing ? (
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Nom</p>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Pays</p>
                                    <p className="font-medium">{user.country}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Cuisine favorite</p>
                                    <p className="font-medium">{user.favoriteCuisine}</p>
                                </div>
                            </div>
                        ) : (
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        defaultValue={user.name}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                                    <input
                                        type="email"
                                        defaultValue={user.email}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Pays</label>
                                        <input
                                            type="text"
                                            defaultValue={user.country}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Cuisine favorite</label>
                                        <input
                                            type="text"
                                            defaultValue={user.favoriteCuisine}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditing(false)}
                                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:brightness-95"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="text-2xl font-bold mb-3">À propos</h2>
                        {!editing ? (
                            <p className="text-sm leading-relaxed">{user.bio}</p>
                        ) : (
                            <textarea
                                rows="4"
                                defaultValue={user.bio}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none text-sm"
                            />
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4">Activité</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="stat-card">
                                <p className="text-xs uppercase tracking-wide text-black">Recettes</p>
                                <p className="mt-2 text-2xl font-bold">{userStats.recipesCount}</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-xs uppercase tracking-wide text-black">Favoris</p>
                                <p className="mt-2 text-2xl font-bold">{userStats.favoritesCount}</p>
                            </div>
                            <div className="stat-card">
                                <p className="text-xs uppercase tracking-wide text-black">Likes</p>
                                <p className="mt-2 text-2xl font-bold">{userStats.likesCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex border-b border-gray-200 mb-4">
                            <button
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'recipes' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-black'}`}
                                onClick={() => setActiveTab('recipes')}
                            >
                                Mes recettes
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'favorites' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-black'}`}
                                onClick={() => setActiveTab('favorites')}
                            >
                                Mes favoris
                            </button>
                        </div>

                        {Array.isArray(displayedRecipes) && displayedRecipes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedRecipes.map((recipe) => (
                                    <div key={recipe.id || recipe._id} className="card">
                                        <div className="h-48 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg mb-4"/>
                                        <p className="font-semibold text-sm mb-1">
                                            {recipe.title || recipe.name || 'Recette'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {recipe.country || recipe.type || 'Pays'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">
                                    {activeTab === 'recipes' ? 'Aucune recette publiée' : 'Aucun favori'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
