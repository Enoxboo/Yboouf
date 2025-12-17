import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, User, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import logo from '../../assets/logo_yboouf.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 shadow-md bg-[#095d63] dark:bg-gray-800 transition-colors duration-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
                        <img src={logo} alt="logo_yboouf" className="h-30 object-contain"/>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center space-x-4">
                        {/* Bouton Dark Mode */}
                        <ThemeToggle />

                        {user ? (
                            <>
                                <Link to="/add-recipe" className="btn-primary flex items-center space-x-2">
                                    <Plus size={18}/>
                                    <span>Ajouter une recette</span>
                                </Link>

                                <Link to="/profile"
                                      className="flex items-center space-x-2 text-white dark:text-gray-300 hover:text-gray-200 dark:hover:text-white transition-colors">
                                    <User size={20}/>
                                    <span>{user.username}</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-white dark:text-gray-300 hover:text-red-400 dark:hover:text-red-500 transition-colors"
                                >
                                    <LogOut size={20}/>
                                    <span>Déconnexion</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/auth" className="btn-secondary">
                                    Connexion/Inscription
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
