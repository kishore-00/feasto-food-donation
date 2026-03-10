const express = require('express');
const router = express.Router();
const { createListing, getListings, claimListing, getMyListings, getMyClaims, deleteListing } = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createListing);
router.get('/', getListings);
router.put('/:id/claim', protect, claimListing);
router.get('/my-listings', protect, getMyListings);
router.get('/my-claims', protect, getMyClaims);
router.delete('/:id', protect, deleteListing);

module.exports = router;

