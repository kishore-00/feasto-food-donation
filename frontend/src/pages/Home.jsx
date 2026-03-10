import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MapComponent from '../components/MapComponent';
import DonationCard from '../components/DonationCard';
import Modal from '../components/Modal';
import HeroSection from '../components/HeroSection';
import FilterBar from '../components/FilterBar';
import axios from 'axios';
import { AdjustmentsHorizontalIcon, MapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [listings, setListings] = useState([]);
    const [searchParams] = useSearchParams();
    const urlListingId = searchParams.get('listingId');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [showExpiredModal, setShowExpiredModal] = useState(false);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/listings');
                setListings(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching listings:", err);
                setListings([]);
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const { user } = useAuth();
    const navigate = useNavigate();

    const handleClaim = async (id) => {
        if (!user) {
            alert("Please log in to claim donations.");
            navigate('/login');
            return false;
        }

        try {
            await axios.put(`http://localhost:5000/api/listings/${id}/claim`);
            // Refresh listings
            const res = await axios.get('http://localhost:5000/api/listings');
            setListings(res.data);
            return true;
        } catch (err) {
            console.error("Error claiming:", err);
            if (err.response?.data?.code === 'EXPIRED' || err.response?.data?.message?.includes('expired')) {
                setShowExpiredModal(true);
            } else {
                alert(err.response?.data?.message || "Failed to claim donation.");
            }
            return false;
        }
    };

    // Filter Logic
    const filteredListings = listings.filter(item => {
        const matchesType = filter === 'all' || item.type?.toLowerCase() === filter.toLowerCase();
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch = !searchLower ||
            item.title?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.location?.address?.toLowerCase().includes(searchLower) ||
            item.donor?.name?.toLowerCase().includes(searchLower);
        return matchesType && matchesSearch;
    });

    return (
        <div className="flex-1 pb-20">
            <Navbar />

            <HeroSection onSearch={setSearchTerm} searchValue={searchTerm} />

            <FilterBar activeFilter={filter} onFilterChange={setFilter} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 font-heading">
                        Nearby Donations <span className="text-gray-400 text-lg font-normal ml-2">({filteredListings.length})</span>
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode(prev => prev === 'list' ? 'map' : 'list')}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 bg-white"
                        >
                            {viewMode === 'list' ? (
                                <>
                                    <MapIcon className="h-5 w-5 text-gray-500" />
                                    <span className="hidden sm:inline">Map View</span>
                                </>
                            ) : (
                                <>
                                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                                    <span className="hidden sm:inline">List View</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    </div>
                ) : (
                    <>
                        {viewMode === 'map' ? (
                            <div className="relative z-0 w-full h-[600px] mb-8">
                                <MapComponent listings={filteredListings} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredListings.length === 0 ? (
                                    <div className="col-span-full py-12 text-center">
                                        <span className="text-6xl block mb-4">🥣</span>
                                        <h3 className="text-lg font-medium text-gray-900">No donations found</h3>
                                        <p className="text-gray-500">Try changing your filters or search term.</p>
                                    </div>
                                ) : (
                                    filteredListings.map(listing => (
                                        <DonationCard
                                            key={listing._id}
                                            listing={listing}
                                            onClaim={handleClaim}
                                            autoOpen={listing._id === urlListingId}
                                            onExpiredAttempt={() => setShowExpiredModal(true)}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Expired Item Modal */}
            <Modal
                isOpen={showExpiredModal}
                onClose={() => setShowExpiredModal(false)}
                title="Oops! Too Late ⏳"
            >
                <div className="space-y-4 text-center">
                    <div className="text-5xl mb-2">😢</div>
                    <p className="text-gray-600 text-lg">
                        This donation has just expired.
                    </p>
                    <p className="text-gray-500">
                        For health and safety reasons, we cannot allow claims on expired food.
                        Please check out other available donations nearby!
                    </p>
                    <div className="mt-6">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-brand-600 text-base font-bold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                            onClick={() => setShowExpiredModal(false)}
                        >
                            Explore Other Donations
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Home;
