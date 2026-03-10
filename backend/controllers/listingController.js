const Listing = require('../models/Listing');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Donor)
exports.createListing = async (req, res) => {
    try {
        const { title, description, quantity, type, expiryDate, location, pickupInstructions, price } = req.body;

        // User ID from auth middleware
        const donorId = req.user.id;

        if (!donorId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const listing = await Listing.create({
            title,
            description,
            quantity,
            type,
            price: price || 0,
            expiryDate,
            donor: donorId,
            location, // { type: 'Point', coordinates: [lng, lat], address: '...' }
            pickupInstructions
        });

        // Get donor info for notification
        const donor = await User.findById(donorId);
        const donorName = donor?.name || 'A donor';
        const locationAddress = location?.address || 'your area';

        // Notify users in the locality (within 5km radius)
        let nearbyUsers = [];

        if (location && location.coordinates && location.coordinates[0] !== 0) {
            // Find users with location within 5km
            nearbyUsers = await User.find({
                role: { $in: ['volunteer', 'recipient'] },
                location: {
                    $nearSphere: {
                        $geometry: {
                            type: 'Point',
                            coordinates: location.coordinates
                        },
                        $maxDistance: 5000 // 5km in meters
                    }
                }
            });
        }

        // If no nearby users found with geo query, notify all volunteers and recipients
        if (nearbyUsers.length === 0) {
            nearbyUsers = await User.find({ role: { $in: ['volunteer', 'recipient'] } });
        }

        const notifications = nearbyUsers.map(user => ({
            recipient: user._id,
            type: 'new_donation',
            message: user.role === 'volunteer'
                ? `New donation near you! "${title}" (${quantity}) posted by ${donorName}. Claim it before someone else does!`
                : `New food available! "${title}" (${quantity}) has been donated near ${locationAddress}. A volunteer will pick it up soon.`,
            listing: listing._id
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(listing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get listings (with optional geo-query)
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res) => {
    try {
        const { lat, lng, distanceInKm } = req.query;

        let query = { status: 'available' };

        // If lat/lng provided, use geospatial query
        if (lat && lng) {
            const radius = distanceInKm ? parseFloat(distanceInKm) : 5; // Default 5km
            const radiusInRadians = radius / 6378.1; // Earth radius in km

            query.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    // $maxDistance is in meters
                    $maxDistance: radius * 1000
                }
            };
        }

        const listings = await Listing.find(query).populate('donor', 'name phone');
        res.status(200).json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Claim a listing
// @route   PUT /api/listings/:id/claim
// @access  Private (Volunteer)
exports.claimListing = async (req, res) => {
    try {
        const listingId = req.params.id;
        const volunteerId = req.user.id; // From middleware

        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.status !== 'available') {
            return res.status(400).json({ message: 'Listing is no longer available' });
        }

        // Check if listing has expired
        if (new Date() > new Date(listing.expiryDate)) {
            return res.status(400).json({ message: 'This donation has expired', code: 'EXPIRED' });
        }

        // Update listing status
        listing.status = 'claimed';
        await listing.save();

        // Create Transaction record
        const transaction = await Transaction.create({
            listing: listingId,
            volunteer: volunteerId,
            status: 'claimed',
            history: [{
                status: 'claimed',
                timestamp: Date.now()
            }]
        });

        res.status(200).json({ message: 'Listing claimed successfully', transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get listings created by current donor
// @route   GET /api/listings/my-listings
// @access  Private
exports.getMyListings = async (req, res) => {
    try {
        const listings = await Listing.find({ donor: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(listings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get claims made by current volunteer
// @route   GET /api/listings/my-claims
// @access  Private
exports.getMyClaims = async (req, res) => {
    try {
        const transactions = await Transaction.find({ volunteer: req.user.id })
            .populate({
                path: 'listing',
                populate: { path: 'donor', select: 'name phone' }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a listing (donor only)
// @route   DELETE /api/listings/:id
// @access  Private (Donor)
exports.deleteListing = async (req, res) => {
    try {
        const listingId = req.params.id;
        const donorId = req.user.id;

        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if the user is the owner of the listing
        if (listing.donor.toString() !== donorId) {
            return res.status(403).json({ message: 'Not authorized to delete this listing' });
        }

        // Only allow deletion if listing is still available
        if (listing.status !== 'available') {
            return res.status(400).json({ message: 'Cannot delete a listing that has been claimed or picked up' });
        }

        await Listing.findByIdAndDelete(listingId);

        // Also delete any notifications related to this listing
        await Notification.deleteMany({ listing: listingId });

        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
