import {Link, useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {Plus, User, LogOut, Menu, X} from 'lucide-react';
import {useState, useEffect} from 'react';
import ThemeToggle from './ThemeToggle';
import logo from '../../assets/logo_yboouf.png';

const Navbar = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    // Fermer le menu au changement de route
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Fermer le menu quand on clique sur un lien
    const closeMenu = () => setIsOpen(false);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 shadow-md bg-[#095d63] dark:bg-gray-800 transition-colors duration-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-14 sm:h-16">
                    {/* Logo */}
                    <Link to="/" onClick={closeMenu} className="flex items-center space-x-2 text-primary font-bold text-lg sm:text-xl flex-shrink-0">
                        <img src={logo} alt="logo_yboouf" className="h-22 sm:h-24 object-contain"/>
                    </Link>

                    {/* Navigation Desktop - Hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Bouton Dark Mode */}
                        <ThemeToggle/>

                        {user ? (
                            <>
                                <Link to="/add-recipe" className="btn-secondary flex items-center space-x-2 text-sm sm:text-base">
                                    <Plus size={18}/>
                                    <span>Ajouter une recette</span>
                                </Link>

                                <Link to="/profile"
                                      className="flex items-center space-x-2 text-white dark:text-gray-300 hover:text-gray-200 dark:hover:text-white transition-colors text-sm sm:text-base">
                                    <User size={20}/>
                                    <span>{user.username}</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-white dark:text-white hover:text-red-400 dark:hover:text-red-500 transition-colors"
                                >
                                    <LogOut size={20}/>
                                    <span>Déconnexion</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-primary font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base"
                                >
                                    Inscription
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button & Theme Toggle */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle/>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu - Visible only on mobile when open */}
                {isOpen && (
                    <div className="md:hidden bg-[#084a4e] dark:bg-gray-700 border-t border-white/10 py-4">
                        <div className="flex flex-col space-y-3">
                            {user ? (
                                <>
                                    <Link to="/add-recipe" onClick={closeMenu} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2">
                                        <Plus size={18}/>
                                        <span>Ajouter une recette</span>
                                    </Link>

                                    <Link to="/profile" onClick={closeMenu}
                                          className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2">
                                        <User size={20}/>
                                        <span>{user.username}</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-2 w-full text-left"
                                    >
                                        <LogOut size={20}/>
                                        <span>Déconnexion</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={closeMenu}
                                        className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMenu}
                                        className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        Inscription
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
