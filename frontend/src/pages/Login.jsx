import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

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
        <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
            <div className="card max-w-md w-full dark:bg-gray-800">
                <div className="text-center mb-8">
                    <LogIn className="mx-auto h-12 w-12 text-primary mb-4" />
                    <h2 className="text-2xl sm:text-3xl font-bold dark:text-white">Connexion</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
                        Accédez à votre compte Yboouf
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Adresse email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="exemple@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2 dark:text-gray-300">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full text-sm sm:text-base"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    Pas encore de compte ?{' '}
                    <Link to="/register" className="text-primary hover:underline font-medium">
                        Inscrivez-vous
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
