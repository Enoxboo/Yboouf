import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Auth = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await login(loginData.email, loginData.password);
            navigate('/');
        } catch (error) {
            setErrors({ login: error.message || 'Erreur de connexion' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        if (registerData.password !== registerData.confirmPassword) {
            setErrors({ register: 'Les mots de passe ne correspondent pas' });
            setLoading(false);
            return;
        }

        try {
            await register(registerData.username, registerData.email, registerData.password);
            navigate('/');
        } catch (error) {
            setErrors({ register: error.message || "Erreur lors de l'inscription" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-page-light flex items-center justify-center py-6 px-4">
            <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-5">


            <div className="card p-5">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-1">
                            Connexion
                        </h2>
                        <p className="text-xs">
                            Connectez-vous pour accéder à vos recettes
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3">
                        {errors.login && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                                <p className="text-red-600 dark:text-red-400 text-xs">{errors.login}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm disabled:opacity-50"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    <div className="mt-3 text-center">
                        <a href="#" className="text-primary hover:text-secondary text-xs">
                            Mot de passe oublié ?
                        </a>
                    </div>
                </div>

                <div className="card p-5">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold mb-1">
                            Inscription
                        </h2>
                        <p className="text-xs">
                            Créez un compte pour partager vos recettes
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-3">
                        {errors.register && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                                <p className="text-red-600 dark:text-red-400 text-xs">{errors.register}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={registerData.username}
                                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="VotreNom"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="votre@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={registerData.confirmPassword}
                                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-2 text-sm disabled:opacity-50"
                        >
                            {loading ? 'Inscription...' : "S'inscrire"}
                            <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Auth;
