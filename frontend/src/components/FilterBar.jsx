import React from 'react';

const categories = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'veg', label: 'Veg', icon: '🥗' },
    { id: 'non-veg', label: 'Non-Veg', icon: '🍗' },
    { id: 'bakery', label: 'Bakery', icon: '🥐' },
    { id: 'cooked', label: 'Cooked', icon: '🥘' },
    { id: 'raw', label: 'Raw Ingredients', icon: '🥦' },
];

const FilterBar = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="sticky top-20 z-30 bg-gray-50/95 backdrop-blur-sm py-4 border-b border-gray-200/50 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onFilterChange(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${activeFilter === cat.id
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md transform -translate-y-0.5'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-lg">{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
