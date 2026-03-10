import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const HeroSection = ({ onSearch, searchValue = '' }) => {
    const [localSearch, setLocalSearch] = useState(searchValue);
    return (
        <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 mt-4">
                    Delicious food, <span className="text-brand-600">Zero waste.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-500 mb-10 font-light">
                    Connect with local donors and volunteers to rescue surplus food. Help us build a hunger-free community, one meal at a time.
                </p>

                <div className="max-w-2xl mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-14 pr-4 py-4 rounded-full border border-gray-100 shadow-sm text-gray-900 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-base placeholder-gray-400 bg-white"
                        placeholder="Search for donations near you..."
                        value={localSearch}
                        onChange={(e) => {
                            setLocalSearch(e.target.value);
                            if (onSearch) onSearch(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && onSearch) {
                                onSearch(localSearch);
                            }
                        }}
                    />
                    <div className="absolute inset-y-2 right-2">
                        <button
                            onClick={() => onSearch && onSearch(localSearch)}
                            className="bg-brand-600 text-white rounded-full px-6 py-2 font-medium hover:bg-brand-700 transition-colors h-full"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
