import React from 'react';
import { getFoodIcon, getFoodImagePlaceholder } from '../utils/FoodIcons';
import { MapPinIcon, ClockIcon, ArrowTopRightOnSquareIcon, PhoneIcon, UserIcon, CalendarIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useState, useMemo } from 'react';
import Modal from './Modal';
import PaymentModal from './PaymentModal';

const DonationCard = ({ listing, onClaim, autoOpen = false, onExpiredAttempt }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const isAvailable = listing.status === 'available';

    // Auto open details modal if requested
    React.useEffect(() => {
        if (autoOpen) {
            setShowDetailsModal(true);
        }
    }, [autoOpen]);

    const isPaid = listing.price && listing.price > 0;
    const foodIcon = getFoodIcon(listing.type);
    const bgGradient = getFoodImagePlaceholder(listing.type);

    // Calculate actual hours remaining until expiry
    const timeRemaining = useMemo(() => {
        if (!listing.expiryDate) return null;

        const now = new Date();
        const expiry = new Date(listing.expiryDate);
        const diffMs = expiry - now;

        if (diffMs <= 0) {
            return { expired: true, text: 'Expired' };
        }

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return { expired: false, text: `${diffDays}d ${diffHours % 24}h left` };
        } else if (diffHours > 0) {
            return { expired: false, text: `${diffHours}h left` };
        } else {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return { expired: false, text: `${diffMins}m left` };
        }
    }, [listing.expiryDate]);

    const handleGetDirections = () => {
        const destLat = listing.location.coordinates[1];
        const destLng = listing.location.coordinates[0];

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destLat},${destLng}&travelmode=driving`,
                        '_blank'
                    );
                },
                () => {
                    window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
                        '_blank'
                    );
                }
            );
        } else {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`,
                '_blank'
            );
        }
    };

    return (
        <>
            <div
                onClick={() => setShowDetailsModal(true)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer border border-gray-100/50"
            >
                {/* Image Placeholder Area */}
                <div className={`h-40 w-full bg-gradient-to-br ${bgGradient} relative flex items-center justify-center overflow-hidden`}>
                    <span className="text-6xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                        {foodIcon}
                    </span>

                    {/* Floating Badges */}
                    <div className={`absolute top-3 right-3 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 ${timeRemaining?.expired
                        ? 'bg-red-100/90 text-red-800'
                        : 'bg-white/90 text-gray-800'
                        }`}>
                        <ClockIcon className={`h-3 w-3 ${timeRemaining?.expired ? 'text-red-500' : 'text-brand-500'}`} />
                        {timeRemaining?.text || 'No expiry'}
                    </div>

                    {/* Price Badge */}
                    <div className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {isPaid ? `₹${listing.price}` : 'Free'}
                    </div>

                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                        {listing.type}
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 font-heading line-clamp-1 group-hover:text-brand-600 transition-colors">
                            {listing.title}
                        </h3>
                    </div>

                    <div className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-semibold text-gray-600">
                            {listing.quantity}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="truncate">by {listing.donor?.name || 'Local Donor'}</span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                        {listing.description}
                    </p>

                    {/* Footer - Simplified */}
                    <div className="pt-3 border-t border-gray-50 mt-auto">
                        <div className="flex items-center justify-between">
                            {listing.location && (
                                <div className="flex items-center text-xs text-gray-500">
                                    <MapPinIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                    <span className="truncate max-w-[120px]">{listing.location.address || "Location available"}</span>
                                </div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetailsModal(true);
                                }}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                            >
                                View Details →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title={listing.title}
            >
                <div className="space-y-5">
                    {/* Header with icon and type */}
                    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 flex items-center justify-center`}>
                        <span className="text-7xl drop-shadow-md">{foodIcon}</span>
                    </div>

                    {/* Status and Price */}
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {isAvailable ? '✓ Available' : listing.status}
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${isPaid ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                            {isPaid ? `₹${listing.price}` : '🎁 Free'}
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-purple-100 text-purple-800 uppercase">
                            {listing.type}
                        </span>
                    </div>

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {listing.description}
                        </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <InformationCircleIcon className="h-4 w-4" />
                                Quantity
                            </div>
                            <p className="font-semibold text-gray-800">{listing.quantity}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <ClockIcon className="h-4 w-4" />
                                Expires
                            </div>
                            <p className={`font-semibold ${timeRemaining?.expired ? 'text-red-600' : 'text-gray-800'}`}>
                                {timeRemaining?.text || 'Not specified'}
                            </p>
                        </div>
                    </div>

                    {/* Donor Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Donor Information
                        </h4>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">{listing.donor?.name || 'Anonymous Donor'}</span>
                            </p>
                            {listing.donor?.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                                    {listing.donor.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Location */}
                    {listing.location && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4" />
                                Pickup Location
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                                {listing.location.address || 'Location coordinates available'}
                            </p>
                            {listing.location.coordinates && (
                                <button
                                    onClick={handleGetDirections}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                    Get Directions
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pickup Instructions */}
                    {listing.pickupInstructions && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-yellow-800 mb-2">📝 Pickup Instructions</h4>
                            <p className="text-sm text-yellow-700 italic">
                                "{listing.pickupInstructions}"
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="flex-1 py-2.5 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                if (timeRemaining?.expired) {
                                    setShowDetailsModal(false);
                                    if (onExpiredAttempt) onExpiredAttempt();
                                    return;
                                }
                                setShowDetailsModal(false);
                                setShowConfirmModal(true);
                            }}
                            disabled={!isAvailable}
                            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors ${isAvailable
                                ? 'bg-brand-600 text-white hover:bg-brand-700'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isAvailable ? 'Claim Donation' : 'Unavailable'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal - For Free Donations */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title={isPaid ? "Confirm Payment & Claim" : "Confirm Claim"}
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        {isPaid
                            ? `This listing requires a payment of ₹${listing.price} to the donor. Click "Proceed to Pay" to complete the transaction.`
                            : "Are you sure you want to claim this donation?"}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Please contact the donor immediately after claiming to arrange pickup.
                    </p>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none sm:col-start-2 sm:text-sm"
                            onClick={async () => {
                                setShowConfirmModal(false);
                                if (isPaid) {
                                    // Show payment modal for paid donations
                                    setShowPaymentModal(true);
                                } else {
                                    // Direct claim for free donations
                                    const success = await onClaim(listing._id);
                                    if (success) {
                                        setShowSuccessModal(true);
                                    }
                                }
                            }}
                        >
                            {isPaid ? '💳 Proceed to Pay' : 'Confirm Claim'}
                        </button>
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                            onClick={() => setShowConfirmModal(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal - For Paid Donations */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={listing.price}
                listingTitle={listing.title}
                onPaymentSuccess={async (paymentInfo) => {
                    setShowPaymentModal(false);
                    // After successful payment, claim the donation
                    const success = await onClaim(listing._id);
                    if (success) {
                        setShowSuccessModal(true);
                    }
                }}
            />

            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="🎉 Donation Claimed!"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        You have successfully claimed this donation. Thank you for helping reduce food waste!
                    </p>
                    <p className="text-gray-500 text-sm">
                        Pickup details have been saved to your dashboard.
                    </p>
                    <div className="mt-5 sm:mt-6">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none sm:text-sm"
                            onClick={() => {
                                setShowSuccessModal(false);
                            }}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default DonationCard;
