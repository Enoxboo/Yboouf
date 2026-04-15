import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ybooufLogo from '../assets/yboouf.webp';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);

        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Erreur lors de l\'inscription';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col md:flex-row">

                    <div className="md:w-2/5 flex items-center justify-center bg-gray-100 dark:bg-gray-900/40 p-8 sm:p-12">
                        <img
                            src={ybooufLogo}
                            alt="Logo Yboouf"
                            className="h-40 w-40 sm:h-52 sm:w-52 md:h-64 md:w-64 object-contain"
                        />
                    </div>

                    <div className="md:w-3/5 p-6 sm:p-8 md:p-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Créer un compte
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                            Rejoins Yboouf pour partager et découvrir des recettes du monde.
                        </p>

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nom d'utilisateur
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    pattern="[a-zA-Z0-9_]+"
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                    placeholder="Ex : Paul"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Adresse email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                    placeholder="exemple@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                    placeholder="Au moins 6 caractères"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                    placeholder="Ressaisis ton mot de passe"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-primary px-4 py-3 text-sm sm:text-base font-semibold text-white dark:text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? 'Inscription...' : 'Créer mon compte'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            Déjà un compte ?{' '}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                Connectez-vous
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;