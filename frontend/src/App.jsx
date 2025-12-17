import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import RecipePage from './pages/RecipePage';
import Footer from './components/common/Footer';
import Auth from './pages/Auth';

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
                            <Route path="/auth" element={<Auth />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
