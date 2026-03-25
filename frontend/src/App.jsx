import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import RecipePage from './pages/RecipePage';
import Login from './pages/Login';
import Register from './pages/Register';
import AddRecipe from './pages/AddRecipe';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'sonner';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow container mx-auto px-4 py-8 mt-20">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/recipe/:id" element={<RecipePage />} />
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
