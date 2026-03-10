// Utility to get a relevant emoji/icon based on food type
export const getFoodIcon = (type) => {
    switch (type?.toLowerCase()) {
        case 'veg': return '🥗';
        case 'non-veg': return '🍗';
        case 'bakery': return '🥐';
        case 'cooked': return '🥘';
        case 'raw': return '🥦';
        case 'beverage': return '🥤';
        default: return '🍱';
    }
};

export const getFoodImagePlaceholder = (type) => {
    // Return a gradient background class based on type
    switch (type?.toLowerCase()) {
        case 'veg': return 'from-green-100 to-emerald-200';
        case 'non-veg': return 'from-red-100 to-orange-200';
        case 'bakery': return 'from-amber-100 to-yellow-200';
        default: return 'from-blue-100 to-indigo-200';
    }
};
