import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import Modal from './Modal';
import { getDistance, DEFAULT_CENTER, MAX_DISTANCE_KM } from '../utils/geoUtils';

// Fix for default marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, onOutOfBounds, userLocation }) => {
    useMapEvents({
        click(e) {
            const centerToUse = userLocation || DEFAULT_CENTER;
            const distance = getDistance(centerToUse[0], centerToUse[1], e.latlng.lat, e.latlng.lng);
            if (distance > MAX_DISTANCE_KM) {
                onOutOfBounds();
            } else {
                setPosition([e.latlng.lat, e.latlng.lng]);
            }
        },
    });

    return position ? <Marker position={position} /> : null;
};

// Component to center map on position
const MapCenterer = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1 });
        }
    }, [position, map]);
    return null;
};

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
    const [markerPosition, setMarkerPosition] = useState(initialPosition || null);
    const [mapCenter, setMapCenter] = useState(initialPosition || DEFAULT_CENTER);
    const [isLocating, setIsLocating] = useState(false);
    const [showBoundaryModal, setShowBoundaryModal] = useState(false);

    const [userActualLocation, setUserActualLocation] = useState(null);

    // Get user's current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = [pos.coords.latitude, pos.coords.longitude];
                    setUserActualLocation(newPos);
                    
                    if (!initialPosition) {
                        setMapCenter(newPos);
                        // Automatically pin if within service area (which is 0 distance from itself)
                        setMarkerPosition(newPos);
                    }
                },
                () => {
                    // Use default if denied
                }
            );
        }
    }, [initialPosition]);

    // Notify parent when marker position changes
    useEffect(() => {
        if (markerPosition && onLocationSelect) {
            onLocationSelect({
                lat: markerPosition[0],
                lng: markerPosition[1],
                coordinates: [markerPosition[1], markerPosition[0]] // [lng, lat] for GeoJSON
            });
        }
    }, [markerPosition, onLocationSelect]);

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newPos = [pos.coords.latitude, pos.coords.longitude];
                setUserActualLocation(newPos); // Update actual location
                const centerToUse = newPos; // Since they are using current location, distance is 0

                // Current location is always valid relative to itself
                setMarkerPosition(newPos);
                setMapCenter(newPos);
                setIsLocating(false);
            },
            (err) => {
                alert('Unable to get your location. Please click on the map to select.');
                setIsLocating(false);
            }
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Click on the map to mark your pickup location
                </p>
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-700 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50"
                >
                    {isLocating ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            Locating...
                        </>
                    ) : (
                        <>
                            📍 Use My Location
                        </>
                    )}
                </button>
            </div>

            <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    style={{ zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={markerPosition}
                        setPosition={setMarkerPosition}
                        onOutOfBounds={() => setShowBoundaryModal(true)}
                        userLocation={userActualLocation}
                    />
                    <MapCenterer position={mapCenter} />
                </MapContainer>
            </div>

            {markerPosition && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-green-800">
                        Location selected: {markerPosition[0].toFixed(5)}, {markerPosition[1].toFixed(5)}
                    </span>
                </div>
            )}

            <Modal
                isOpen={showBoundaryModal}
                onClose={() => setShowBoundaryModal(false)}
                title="Location Outside Service Area 🗺️"
            >
                <div className="space-y-4 text-center">
                    <div className="text-5xl mb-2">📍</div>
                    <p className="text-gray-600 text-lg font-medium">
                        We kindly apologize!
                    </p>
                    <p className="text-gray-500 text-sm">
                        For logistical reasons, we currently only operate within a {MAX_DISTANCE_KM}km radius of our main service area. We are unable to plot locations outside this proximity.
                    </p>
                    <div className="mt-6">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-brand-600 text-base font-bold text-white hover:bg-brand-700 focus:outline-none transition-colors"
                            onClick={() => setShowBoundaryModal(false)}
                        >
                            Understood
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LocationPicker;
