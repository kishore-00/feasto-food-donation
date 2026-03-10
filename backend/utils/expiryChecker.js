const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Check for donations expiring within the next 2 hours and notify
const checkExpiringDonations = async () => {
    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        const oneHourFromNow = new Date(now.getTime() + 1 * 60 * 60 * 1000);

        // Find available listings expiring within 2 hours that haven't been notified
        const expiringListings = await Listing.find({
            status: 'available',
            expiryDate: { $gte: now, $lte: twoHoursFromNow },
            expiryNotified: { $ne: true }
        }).populate('donor', 'name');

        for (const listing of expiringListings) {
            const expiryTime = new Date(listing.expiryDate);
            const timeDiff = expiryTime - now;
            const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
            const minsLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            // Notify all volunteers about expiring donation
            const volunteers = await User.find({ role: 'volunteer' });
            const notifications = volunteers.map(volunteer => ({
                recipient: volunteer._id,
                type: 'expiry_warning',
                message: `"${listing.title}" expires in ${hoursLeft > 0 ? hoursLeft + 'h ' : ''}${minsLeft}m! Claim it before it's gone.`,
                listing: listing._id
            }));

            // Also notify recipients
            const recipients = await User.find({ role: 'recipient' });
            recipients.forEach(recipient => {
                notifications.push({
                    recipient: recipient._id,
                    type: 'expiry_warning',
                    message: `"${listing.title}" expires in ${hoursLeft > 0 ? hoursLeft + 'h ' : ''}${minsLeft}m! Someone needs to claim it soon.`,
                    listing: listing._id
                });
            });

            // Notify the donor as well
            if (listing.donor) {
                notifications.push({
                    recipient: listing.donor._id,
                    type: 'expiry_warning',
                    message: `Your donation "${listing.title}" expires in ${hoursLeft > 0 ? hoursLeft + 'h ' : ''}${minsLeft}m and hasn't been claimed yet.`,
                    listing: listing._id
                });
            }

            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }

            // Mark listing as notified to prevent duplicate notifications
            listing.expiryNotified = true;
            await listing.save();
        }

        console.log(`[ExpiryChecker] Checked ${expiringListings.length} expiring listings`);
    } catch (error) {
        console.error('[ExpiryChecker] Error:', error.message);
    }
};

// Check for expired donations and mark them
const markExpiredDonations = async () => {
    try {
        const now = new Date();

        const expiredListings = await Listing.updateMany(
            {
                status: 'available',
                expiryDate: { $lt: now }
            },
            {
                status: 'expired'
            }
        );

        if (expiredListings.modifiedCount > 0) {
            console.log(`[ExpiryChecker] Marked ${expiredListings.modifiedCount} listings as expired`);
        }
    } catch (error) {
        console.error('[ExpiryChecker] Error marking expired:', error.message);
    }
};

// Start the expiry checker - runs every 15 minutes
const startExpiryChecker = () => {
    console.log('[ExpiryChecker] Starting expiry notification service...');

    // Run immediately on startup
    checkExpiringDonations();
    markExpiredDonations();

    // Then run every 15 minutes
    setInterval(() => {
        checkExpiringDonations();
        markExpiredDonations();
    }, 15 * 60 * 1000); // 15 minutes
};

module.exports = { startExpiryChecker, checkExpiringDonations, markExpiredDonations };
