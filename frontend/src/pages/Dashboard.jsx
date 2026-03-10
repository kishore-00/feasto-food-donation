import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DonationCard from '../components/DonationCard'; // We might reuse or create a simple variant
import {
    HeartIcon,
    CubeIcon,
    CurrencyRupeeIcon,
    CheckBadgeIcon,
    ClockIcon,
    TruckIcon,
    TrashIcon,
    MapPinIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ArrowsUpDownIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Modal';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white overflow-hidden rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start justify-between transition-transform hover:-translate-y-1 duration-300">
        <div>
            <p className="text-sm font-medium text-gray-500 truncate mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 font-heading">{value}</p>
            {subtext && <p className={`text-xs mt-2 font-medium ${color.text}`}>{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
            <Icon className="h-6 w-6" />
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalItems: 0,
        activeItems: 0,
        totalValue: 0,
        completed: 0
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Filter and Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                let res;
                if (user.role === 'donor') {
                    res = await axios.get('https://feasto-food-donation.onrender.com/api/listings/my-listings');
                    const listings = res.data;
                    setData(listings);

                    // Calc Stats
                    const total = listings.length;
                    const active = listings.filter(l => l.status === 'available').length;
                    const value = listings.reduce((acc, curr) => acc + (curr.price || 0), 0);

                    setStats({
                        totalItems: total,
                        activeItems: active,
                        totalValue: value,
                        completed: total - active
                    });

                } else if (user.role === 'volunteer') {
                    res = await axios.get('https://feasto-food-donation.onrender.com/api/listings/my-claims');
                    // For volunteers, endpoint returns Transaction objects populated with listing
                    const claims = res.data;
                    setData(claims);

                    const total = claims.length;
                    // Mock stats for now
                    const impactScore = total * 10;

                    setStats({
                        totalItems: total,
                        impactScore: impactScore,
                        pending: claims.filter(c => c.status === 'claimed').length,
                        completed: claims.filter(c => c.status === 'delivered').length
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    // Extract fetchData for reuse
    const refreshData = async () => {
        if (!user) return;
        try {
            let res;
            if (user.role === 'donor') {
                res = await axios.get('https://feasto-food-donation.onrender.com/api/listings/my-listings');
                const listings = res.data;
                setData(listings);
                const total = listings.length;
                const active = listings.filter(l => l.status === 'available').length;
                const value = listings.reduce((acc, curr) => acc + (curr.price || 0), 0);
                setStats({ totalItems: total, activeItems: active, totalValue: value, completed: total - active });
            } else if (user.role === 'volunteer') {
                res = await axios.get('https://feasto-food-donation.onrender.com/api/listings/my-claims');
                const claims = res.data;
                setData(claims);
                const total = claims.length;
                const impactScore = total * 10;
                setStats({
                    totalItems: total,
                    impactScore: impactScore,
                    pending: claims.filter(c => c.status === 'claimed').length,
                    completed: claims.filter(c => c.status === 'delivered').length
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteClick = (listing) => {
        setListingToDelete(listing);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!listingToDelete) return;
        setDeleting(true);
        try {
            await axios.delete(`https://feasto-food-donation.onrender.com/api/listings/${listingToDelete._id}`);
            setDeleteModalOpen(false);
            setListingToDelete(null);
            await refreshData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete listing');
        } finally {
            setDeleting(false);
        }
    };

    if (!user) {
        return <div className="p-8 text-center text-gray-500">Please log in to view dashboard.</div>;
    }

    // Filter and Sort Logic
    const filteredAndSortedData = useMemo(() => {
        let result = [...data];

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            result = result.filter(item => {
                const listing = user.role === 'donor' ? item : item.listing;
                if (!listing) return false;
                return (
                    listing.title?.toLowerCase().includes(search) ||
                    listing.description?.toLowerCase().includes(search) ||
                    listing.type?.toLowerCase().includes(search)
                );
            });
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(item => {
                const status = user.role === 'donor' ? item.status : item.status;
                return status === statusFilter;
            });
        }

        // Apply price filter (paid/free)
        if (priceFilter !== 'all') {
            result = result.filter(item => {
                const listing = user.role === 'donor' ? item : item.listing;
                if (!listing) return false;
                const isPaid = listing.price && listing.price > 0;
                if (priceFilter === 'paid') return isPaid;
                if (priceFilter === 'free') return !isPaid;
                return true;
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            const listingA = user.role === 'donor' ? a : a.listing;
            const listingB = user.role === 'donor' ? b : b.listing;
            if (!listingA || !listingB) return 0;

            switch (sortBy) {
                case 'date-desc':
                    return new Date(listingB.createdAt) - new Date(listingA.createdAt);
                case 'date-asc':
                    return new Date(listingA.createdAt) - new Date(listingB.createdAt);
                case 'name-asc':
                    return listingA.title.localeCompare(listingB.title);
                case 'name-desc':
                    return listingB.title.localeCompare(listingA.title);
                case 'expiry-asc':
                    return new Date(listingA.expiryDate) - new Date(listingB.expiryDate);
                case 'expiry-desc':
                    return new Date(listingB.expiryDate) - new Date(listingA.expiryDate);
                default:
                    return 0;
            }
        });

        return result;
    }, [data, searchTerm, statusFilter, sortBy, user?.role]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPriceFilter('all');
        setSortBy('date-desc');
    };

    const hasActiveFilters = searchTerm || statusFilter !== 'all' || priceFilter !== 'all' || sortBy !== 'date-desc';

    return (
        <div className="flex-1 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">

                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">
                        Welcome back, {user.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Here's what's happening with your <span className="font-semibold text-brand-600 capitalize">{user.role}</span> activities.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {user.role === 'donor' ? (
                                <>
                                    <StatCard
                                        title="Total Donations"
                                        value={stats.totalItems}
                                        icon={HeartIcon}
                                        color={{ bg: 'bg-red-50', text: 'text-red-600' }}
                                        subtext="Thank you for sharing!"
                                    />
                                    <StatCard
                                        title="Active Listings"
                                        value={stats.activeItems}
                                        icon={ClockIcon}
                                        color={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
                                        subtext="Currently listed"
                                    />
                                    <StatCard
                                        title="Total Value Provided"
                                        value={`₹${stats.totalValue}`}
                                        icon={CurrencyRupeeIcon}
                                        color={{ bg: 'bg-green-50', text: 'text-green-600' }}
                                        subtext="Estimated impact"
                                    />
                                </>
                            ) : (
                                <>
                                    <StatCard
                                        title="Total Claims"
                                        value={stats.totalItems}
                                        icon={CheckBadgeIcon}
                                        color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                                        subtext="Donations secured"
                                    />
                                    <StatCard
                                        title="Pending Deliveries"
                                        value={stats.pending}
                                        icon={TruckIcon}
                                        color={{ bg: 'bg-yellow-50', text: 'text-yellow-600' }}
                                        subtext="Action required"
                                    />
                                    <StatCard
                                        title="Impact Score"
                                        value={stats.impactScore}
                                        icon={CubeIcon}
                                        color={{ bg: 'bg-purple-50', text: 'text-purple-600' }}
                                        subtext="Community points"
                                    />
                                </>
                            )}
                        </div>

                        {/* Recent Activity Section */}
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <h2 className="text-xl font-bold text-gray-900 font-heading">
                                    {user.role === 'donor' ? 'Your Listings' : 'Recent Claims'}
                                    {filteredAndSortedData.length !== data.length && (
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({filteredAndSortedData.length} of {data.length})
                                        </span>
                                    )}
                                </h2>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${showFilters || hasActiveFilters
                                        ? 'bg-brand-100 text-brand-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <FunnelIcon className="h-4 w-4" />
                                    Filters & Sort
                                    {hasActiveFilters && (
                                        <span className="flex items-center justify-center w-2 h-2 bg-brand-600 rounded-full"></span>
                                    )}
                                </button>
                            </div>

                            {/* Filter Panel */}
                            {showFilters && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                        {/* Search */}
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Search</label>
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Search by title, description..."
                                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 transition-shadow"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Status</label>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 transition-shadow cursor-pointer appearance-none"
                                            >
                                                <option value="all">All Status</option>
                                                <option value="available">Available</option>
                                                <option value="claimed">Claimed</option>
                                                <option value="picked_up">Picked Up</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="expired">Expired</option>
                                            </select>
                                        </div>

                                        {/* Price Type Filter */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Price Type</label>
                                            <select
                                                value={priceFilter}
                                                onChange={(e) => setPriceFilter(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 transition-shadow cursor-pointer appearance-none"
                                            >
                                                <option value="all">All Donations</option>
                                                <option value="free">🎁 Free Only</option>
                                                <option value="paid">💵 Paid Only</option>
                                            </select>
                                        </div>

                                        {/* Sort */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Sort By</label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 transition-shadow cursor-pointer appearance-none"
                                            >
                                                <option value="date-desc">Newest First</option>
                                                <option value="date-asc">Oldest First</option>
                                                <option value="name-asc">Name (A-Z)</option>
                                                <option value="name-desc">Name (Z-A)</option>
                                                <option value="expiry-asc">Expiry (Soonest)</option>
                                                <option value="expiry-desc">Expiry (Latest)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Active Filters & Clear */}
                                    {hasActiveFilters && (
                                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100/50">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {searchTerm && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium shadow-sm">
                                                        "{searchTerm}"
                                                        <button onClick={() => setSearchTerm('')} className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors">
                                                            <XMarkIcon className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {statusFilter !== 'all' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium capitalize shadow-sm">
                                                        {statusFilter}
                                                        <button onClick={() => setStatusFilter('all')} className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors">
                                                            <XMarkIcon className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )}
                                                {priceFilter !== 'all' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium capitalize shadow-sm">
                                                        {priceFilter === 'free' ? '🎁 Free' : '💵 Paid'}
                                                        <button onClick={() => setPriceFilter('all')} className="hover:text-red-500 hover:bg-red-50 rounded-full p-0.5 transition-colors">
                                                            <XMarkIcon className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={clearFilters}
                                                className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors"
                                            >
                                                Clear filters
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {filteredAndSortedData.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="text-6xl mb-4 opacity-50">{hasActiveFilters ? '🔍' : '🍃'}</div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {hasActiveFilters ? 'No matching results' : 'No activity yet'}
                                </h3>
                                <p className="text-gray-500 mt-1 mb-6">
                                    {hasActiveFilters
                                        ? 'Try adjusting your filters to find what you\'re looking for.'
                                        : 'Get started by making a difference today.'}
                                </p>
                                {hasActiveFilters ? (
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Clear Filters
                                    </button>
                                ) : user.role === 'donor' && (
                                    <a href="/create-listing" className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700">
                                        Create Donation
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAndSortedData.map((item) => {
                                    // Normalize data depending on role
                                    const listing = user.role === 'donor' ? item : item.listing;
                                    const status = user.role === 'donor' ? item.status : item.status; // For volunteer, transaction status

                                    // If listing is null (deleted), skip or show error card
                                    if (!listing) return null;

                                    return (
                                        <div key={item._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{listing.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{new Date(listing.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${status === 'available' ? 'bg-green-100 text-green-800' :
                                                    status === 'claimed' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {status}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                                {listing.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <CubeIcon className="h-4 w-4 mr-1" />
                                                    {listing.quantity}
                                                </div>
                                                {listing.price > 0 && (
                                                    <div className="font-bold text-gray-900 text-sm">₹{listing.price}</div>
                                                )}
                                                {listing.price === 0 && (
                                                    <div className="font-bold text-brand-600 text-xs bg-brand-50 px-2 py-1 rounded">Free</div>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex gap-2 mt-4">
                                                {/* Delete button - only for donors with available listings */}
                                                {user.role === 'donor' && status === 'available' && (
                                                    <button
                                                        onClick={() => handleDeleteClick(listing)}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors"
                                                        title="Delete listing"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                )}

                                                {/* Directions button - for volunteers to navigate to donor */}
                                                {user.role === 'volunteer' && listing.location && listing.location.coordinates && (
                                                    <button
                                                        onClick={() => {
                                                            // Get current location and open Google Maps with directions
                                                            if (navigator.geolocation) {
                                                                navigator.geolocation.getCurrentPosition(
                                                                    (position) => {
                                                                        const { latitude, longitude } = position.coords;
                                                                        const destLat = listing.location.coordinates[1];
                                                                        const destLng = listing.location.coordinates[0];
                                                                        window.open(
                                                                            `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destLat},${destLng}&travelmode=driving`,
                                                                            '_blank'
                                                                        );
                                                                    },
                                                                    () => {
                                                                        // Fallback without current location
                                                                        const destLat = listing.location.coordinates[1];
                                                                        const destLng = listing.location.coordinates[0];
                                                                        window.open(
                                                                            `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
                                                                            '_blank'
                                                                        );
                                                                    }
                                                                );
                                                            } else {
                                                                const destLat = listing.location.coordinates[1];
                                                                const destLng = listing.location.coordinates[0];
                                                                window.open(
                                                                    `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
                                                                    '_blank'
                                                                );
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                                                        title="Get directions to donor"
                                                    >
                                                        <MapPinIcon className="h-4 w-4" />
                                                        Get Directions
                                                    </button>
                                                )}
                                            </div>

                                            {/* Decorative background circle */}
                                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-brand-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setListingToDelete(null);
                }}
                title="Delete Donation"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete <span className="font-semibold">"{listingToDelete?.title}"</span>?
                    </p>
                    <p className="text-sm text-gray-500">
                        This action cannot be undone. The listing will be permanently removed.
                    </p>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                            type="button"
                            disabled={deleting}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-50 sm:col-start-2 sm:text-sm"
                            onClick={confirmDelete}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setListingToDelete(null);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
