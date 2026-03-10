import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LocationPicker from '../components/LocationPicker';
import { getDistance, DEFAULT_CENTER, MAX_DISTANCE_KM } from '../utils/geoUtils';

const CreateListing = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        quantity: '',
        type: 'veg',
        expiryDate: '',
        address: '',
        pickupInstructions: '',
        price: '',
        isFree: true
    });
    const { title, description, quantity, type, expiryDate, address, pickupInstructions, price, isFree } = formData;
    const [coordinates, setCoordinates] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showBoundaryModal, setShowBoundaryModal] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);

    // Handle location selection from map
    const handleLocationSelect = useCallback((location) => {
        setCoordinates(location.coordinates);
        setFormData(prev => ({
            ...prev,
            address: `Selected Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
        }));
    }, []);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Toggle price input
    const handleTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            isFree: type === 'free',
            price: type === 'free' ? '' : prev.price
        }));
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLocationClick = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Get user's current location seamlessly
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true); // temporary spinner for geo
        navigator.geolocation.getCurrentPosition((position) => {
            // Since this is the user's current location, the distance from their current location is 0.
            // It is inherently within the 5km radius of itself.
            setCoordinates([position.coords.longitude, position.coords.latitude]);
            setFormData(prev => ({ ...prev, address: `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})` }));
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError('Unable to retrieve location.');
            setLoading(false);
        });
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Check if we have coordinates (from "Use Current Location").
        // If not, and user typed an address, we'll use dummy coordinates [0,0] or similar since we don't have a geocoder.

        const finalCoordinates = coordinates || [0, 0];

        const location = {
            type: 'Point',
            coordinates: finalCoordinates,
            address: address || "No address provided"
        };

        try {
            await axios.post('http://localhost:5000/api/listings', {
                title,
                description,
                quantity,
                type,
                expiryDate,
                location,
                pickupInstructions,
                price: isFree ? 0 : Number(price)
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setLoading(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Error creating listing');
            setLoading(false);
        }
    };

    return (
        <div className="flex-1">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Donate Food</h1>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <form onSubmit={onSubmit} className="bg-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-xl shadow-gray-200/40 border border-gray-100">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input type="text" name="title" value={title} onChange={onChange} required className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400" placeholder="e.g., Leftover Rice from Event" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea name="description" value={description} onChange={onChange} required rows="3" className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400" placeholder="Brief details about the food..."></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                            <input type="text" name="quantity" value={quantity} onChange={onChange} required className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400" placeholder="e.g. 5kg" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Food Type</label>
                            <select name="type" value={type} onChange={onChange} className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm appearance-none cursor-pointer">
                                <option value="veg">Veg</option>
                                <option value="non-veg">Non-Veg</option>
                                <option value="bakery">Bakery</option>
                                <option value="cooked">Cooked Meals</option>
                                <option value="raw">Raw Ingredients</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Listing Type</label>
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => handleTypeToggle('free')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm transition-all border ${isFree ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                🎁 Free Donation
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeToggle('paid')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm transition-all border ${!isFree ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                💵 Paid / For Sale
                            </button>
                        </div>
                        {!isFree && (
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={price}
                                    onChange={onChange}
                                    min="0"
                                    required={!isFree}
                                    className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400"
                                    placeholder="e.g. 50"
                                />
                                <p className="mt-2 text-xs text-gray-500">Donors can request a nominal fee for certain items.</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                        <input type="datetime-local" name="expiryDate" value={expiryDate} onChange={onChange} required className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm cursor-pointer" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Pickup Location</label>

                        {/* Toggle buttons for location method */}
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setShowMapPicker(false)}
                                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${!showMapPicker
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                📝 Enter Address
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowMapPicker(true)}
                                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors ${showMapPicker
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                🗺️ Pick on Map
                            </button>
                        </div>

                        {/* Address input or Map picker */}
                        {!showMapPicker ? (
                            <div className="flex rounded-xl shadow-sm overflow-hidden border border-gray-200">
                                <input
                                    type="text"
                                    name="address"
                                    value={address}
                                    onChange={onChange}
                                    required
                                    className="flex-1 min-w-0 block w-full px-4 py-3 bg-white border-none focus:ring-0 text-gray-900 sm:text-sm"
                                    placeholder="Enter pickup address"
                                />
                                <button
                                    type="button"
                                    onClick={handleLocationClick}
                                    className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 border-l border-gray-200 transition-colors"
                                >
                                    📍 Use Current
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-xl overflow-hidden border border-gray-200">
                                <LocationPicker
                                    onLocationSelect={handleLocationSelect}
                                    initialPosition={coordinates ? [coordinates[1], coordinates[0]] : null}
                                />
                            </div>
                        )}

                        {/* Show selected coordinates */}
                        {coordinates && coordinates[0] !== 0 && (
                            <p className="mt-3 text-xs text-gray-500 bg-gray-50 inline-block px-3 py-1.5 rounded-lg">
                                📍 Coordinates: {coordinates[1].toFixed(5)}, {coordinates[0].toFixed(5)}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Instructions <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <textarea name="pickupInstructions" value={pickupInstructions} onChange={onChange} rows="2" className="block w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors sm:text-sm placeholder-gray-400" placeholder="e.g. Call 555-0123 upon arrival"></textarea>
                    </div>

                    <div className="pt-6">
                        <button type="submit" disabled={loading} className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-brand-200 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? 'Posting...' : 'Post Donation'}
                        </button>
                    </div>
                </form>

                <Modal
                    isOpen={showSuccessModal}
                    onClose={() => navigate('/')}
                    title="🎉 Listing Posted Successfully!"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Your food listing has been shared with our community. Thank you for your contribution!
                        </p>
                        <div className="mt-5 sm:mt-6">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none sm:text-sm"
                                onClick={() => navigate('/')}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={showBoundaryModal}
                    onClose={() => setShowBoundaryModal(false)}
                    title="Location Outside Service Area 🗺️"
                >
                    <div className="space-y-4 text-center">
                        <div className="text-5xl mb-2">📍</div>
                        <p className="text-gray-600 text-lg font-medium">
                            We kindly apologize!
                        </p>
                        <p className="text-gray-500 text-sm">
                            For logistical reasons, we currently only operate within a {MAX_DISTANCE_KM}km radius of our main service area. We are unable to use your current location as it is outside this proximity.
                        </p>
                        <div className="mt-6">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-brand-600 text-base font-bold text-white hover:bg-brand-700 focus:outline-none transition-colors"
                                onClick={() => setShowBoundaryModal(false)}
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default CreateListing;
