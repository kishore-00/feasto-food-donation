import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icon in React Leaflet
import L from 'leaflet';
import 'leaflet-routing-machine';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const userIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: 'user-marker-icon'
});

const destinationIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: 'destination-marker-icon'
});

// Helper component to fix map rendering issues when toggling visibility
const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map]);
    return null;
};

// Component to update map center when user location changes
const LocationUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

// Routing component that draws route between user and destination
const RoutingMachine = ({ userPosition, destination, onClearRoute }) => {
    const map = useMap();

    useEffect(() => {
        if (!userPosition || !destination) return;

        // Create routing control
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userPosition[0], userPosition[1]),
                L.latLng(destination.lat, destination.lng)
            ],
            routeWhileDragging: false,
            showAlternatives: true,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [
                    { color: '#6366f1', weight: 6, opacity: 0.8 },
                    { color: '#4f46e5', weight: 4, opacity: 1 }
                ]
            },
            altLineOptions: {
                styles: [
                    { color: '#94a3b8', weight: 4, opacity: 0.6 }
                ]
            },
            createMarker: function (i, waypoint, n) {
                const isStart = i === 0;
                return L.marker(waypoint.latLng, {
                    icon: isStart ? userIcon : destinationIcon
                }).bindPopup(isStart ? '📍 Your Location' : `🎯 ${destination.title}`);
            }
        }).addTo(map);

        // Fit bounds to show entire route
        const bounds = L.latLngBounds([
            [userPosition[0], userPosition[1]],
            [destination.lat, destination.lng]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });

        return () => {
            map.removeControl(routingControl);
        };
    }, [map, userPosition, destination]);

    return null;
};

const MapComponent = ({ listings }) => {
    // Default center (fallback if geolocation fails)
    const defaultPosition = [12.9716, 77.5946]; // Bangalore coordinates as fallback
    const [userPosition, setUserPosition] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);

    // Get user's current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserPosition([latitude, longitude]);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.log('Geolocation error:', error.message);
                    setIsLoadingLocation(false);
                }
            );
        } else {
            setIsLoadingLocation(false);
        }
    }, []);

    const handleGetDirections = (listing) => {
        if (!userPosition) {
            alert('Please allow location access to get directions');
            return;
        }
        setSelectedDestination({
            lat: listing.location.coordinates[1],
            lng: listing.location.coordinates[0],
            title: listing.title
        });
    };

    const clearRoute = () => {
        setSelectedDestination(null);
    };

    const mapCenter = userPosition || defaultPosition;

    return (
        <div className="h-full w-full rounded-lg overflow-hidden shadow-lg border border-gray-200" style={{ position: 'relative', zIndex: 0 }}>
            {/* Clear Route Button */}
            {selectedDestination && (
                <button
                    onClick={clearRoute}
                    className="absolute top-4 right-4 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <span>✕</span> Clear Route
                </button>
            )}

            {/* Route Info Bar */}
            {selectedDestination && (
                <div className="absolute top-4 left-4 z-[1000] bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                    <p className="text-sm font-semibold text-gray-800">
                        🚗 Directions to: <span className="text-indigo-600">{selectedDestination.title}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Route shown on map • Drag waypoints to adjust</p>
                </div>
            )}

            <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full" style={{ zIndex: 0 }}>
                <MapUpdater />
                {!selectedDestination && <LocationUpdater position={userPosition} />}

                {/* Routing Machine - only show when destination selected */}
                {selectedDestination && userPosition && (
                    <RoutingMachine
                        userPosition={userPosition}
                        destination={selectedDestination}
                        onClearRoute={clearRoute}
                    />
                )}

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker - only show when no route active */}
                {userPosition && !selectedDestination && (
                    <Marker position={userPosition}>
                        <Popup>
                            <div className="p-1">
                                <h3 className="font-bold text-blue-600">📍 Your Location</h3>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Donation markers */}
                {listings.map((listing) => (
                    listing.location && (
                        <Marker
                            key={listing._id}
                            position={[listing.location.coordinates[1], listing.location.coordinates[0]]}
                        >
                            <Popup>
                                <div className="p-2 min-w-[200px]">
                                    <h3 className="font-bold text-gray-800 mb-1">{listing.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{listing.quantity}</p>
                                    <p className="text-xs text-gray-500 mb-3">{listing.location.address}</p>
                                    <button
                                        onClick={() => handleGetDirections(listing)}
                                        disabled={!userPosition}
                                        className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2
                                            ${userPosition
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        🚗 Get Directions
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;