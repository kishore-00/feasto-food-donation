import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'donor',
        phone: ''
    });
    // Simplified location for MVP (Bangalore default)
    const location = { type: 'Point', coordinates: [77.5946, 12.9716] };


    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { name, email, password, role, phone } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        const result = await register({ ...formData, location });
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="flex-1">
            <Navbar />
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-32">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900 font-heading">
                            Create Account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Join us in fighting food waste today.
                        </p>
                    </div>
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
                    <form className="mt-8 space-y-5" onSubmit={onSubmit}>
                        <div className="space-y-4">
                            <div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400"
                                    placeholder="Password"
                                    value={password}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <input
                                    name="phone"
                                    type="text"
                                    required
                                    className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <select
                                    name="role"
                                    value={role}
                                    onChange={onChange}
                                    className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm appearance-none cursor-pointer"
                                >
                                    <option value="donor">Donor</option>
                                    <option value="volunteer">Volunteer</option>
                                    <option value="recipient">Recipient</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors shadow-md shadow-brand-200"
                            >
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
