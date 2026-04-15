import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ybooufLogo from '@/assets/yboouf.webp';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center px-4 py-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-full flex-col md:flex-row">
                    <div className="md:w-2/5 flex items-center justify-center bg-gray-100 p-6 sm:p-8 dark:bg-gray-900/40">
                        <img
                            src={ybooufLogo}
                            alt="Logo Yboouf"
                            className="h-32 w-32 object-contain sm:h-40 sm:w-40 md:h-52 md:w-52"
                        />
                    </div>

                    <div className="md:w-3/5 flex flex-col justify-center p-5 sm:p-6 md:p-8">
                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            Connexion
                        </h1>
                        <p className="mb-5 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                            Accédez à votre compte Yboouf.
                        </p>

                        {error && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Adresse email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                    placeholder="exemple@email.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                    placeholder="Votre mot de passe"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-primary px-4 py-3 text-sm sm:text-base font-semibold text-white dark:text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                            Pas encore de compte ?{' '}
                            <Link to="/register" className="font-medium text-primary hover:underline">
                                Inscrivez-vous
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;