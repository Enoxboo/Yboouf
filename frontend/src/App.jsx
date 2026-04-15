import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import RecipePage from './pages/RecipePage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRecipe from './pages/AddRecipe';
import Dashboard from './pages/Dashboard';
import DashboardEditRecipe from './pages/DashboardEditRecipe';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'sonner';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
                    <Navbar />
                    <main className="grow container mx-auto px-4 py-4 sm:py-6 md:py-8 mt-14 sm:mt-16">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/recipe/:id" element={<RecipePage />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/add-recipe"
                                element={
                                    <ProtectedRoute>
                                        <AddRecipe />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add_recipes"
                                element={
                                    <ProtectedRoute>
                                        <AddRecipe />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR', 'SUPER_ADMIN']}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/recipes/:id/edit"
                                element={
                                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                                        <DashboardEditRecipe />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                    <Footer />
                    <Toaster richColors position="top-right" />
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
