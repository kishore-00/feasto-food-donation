import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100/50 py-2' : 'bg-transparent py-4'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="text-3xl">🍲</span>
                            <span className={`text-2xl font-bold font-heading tracking-tight group-hover:text-brand-600 transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                                Feast<span className="text-brand-600">o</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">Home</Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-700 hover:text-brand-600 font-medium transition-colors">Dashboard</Link>
                                <NotificationBell />

                                <div className="h-8 w-px bg-gray-200 mx-2"></div>

                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-gray-500">
                                        Hi, {user.name.split(' ')[0]}
                                    </span>
                                    <Link
                                        to="/create-listing"
                                        className="bg-brand-600 text-white px-5 py-2 rounded-full font-medium hover:bg-brand-700 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Donate Food
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-gray-700 hover:text-brand-600 font-medium px-4 py-2 transition-colors">Login</Link>
                                <Link
                                    to="/register"
                                    className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition-all"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        {user && <NotificationBell />}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-700 hover:text-brand-600 focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="h-8 w-8" />
                            ) : (
                                <Bars3Icon className="h-8 w-8" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 shadow-lg absolute w-full px-4 pt-2 pb-6 space-y-4">
                    <Link to="/" className="block text-gray-700 hover:text-brand-600 font-medium py-2">Home</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="block text-gray-700 hover:text-brand-600 font-medium py-2">Dashboard</Link>
                            <Link to="/create-listing" className="block w-full text-center bg-brand-600 text-white px-5 py-3 rounded-xl font-bold shadow-sm">
                                Donate Food
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left text-gray-500 hover:text-red-500 font-medium py-2"
                            >
                                Logout ({user.name})
                            </button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Link to="/login" className="text-center text-gray-700 border border-gray-200 rounded-xl py-3 font-medium">Login</Link>
                            <Link to="/register" className="text-center bg-gray-900 text-white rounded-xl py-3 font-medium">Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
