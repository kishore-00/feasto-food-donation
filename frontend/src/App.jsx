import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
    return (
        <AuthProvider>
            <div className="relative min-h-screen bg-brand-50 overflow-hidden font-sans">
                {/* Global Background Blobs */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-200/40 blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-accent-200/30 blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10 min-h-screen flex flex-col">
                    <Router>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/create-listing" element={<CreateListing />} />
                        </Routes>
                    </Router>
                </div>
            </div>
        </AuthProvider>
    );
}

export default App;
