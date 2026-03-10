import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { BellIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const API_URL = 'http://localhost:5000/api/notifications';

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(API_URL);
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30 seconds for new notifications
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`${API_URL}/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await handleMarkAsRead(notification._id);
        }
        // Navigate to home if there's a listing associated
        if (notification.listing) {
            setIsOpen(false);
            navigate(`/?listingId=${notification.listing}`);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_donation':
                return '🆕';
            case 'expiry_warning':
                return '⚠️';
            case 'donation_claimed':
                return '✅';
            case 'donation_expired':
                return '❌';
            default:
                return '📢';
        }
    };

    const getNotificationBgColor = (type, read) => {
        if (read) return 'bg-white';
        switch (type) {
            case 'new_donation':
                return 'bg-green-50';
            case 'expiry_warning':
                return 'bg-yellow-50';
            case 'donation_claimed':
                return 'bg-blue-50';
            case 'donation_expired':
                return 'bg-red-50';
            default:
                return 'bg-gray-50';
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            await Promise.all(
                unreadNotifications.map(n => axios.put(`${API_URL}/${n._id}/read`))
            );
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 relative transition-colors"
            >
                <span className="sr-only">View notifications</span>
                {unreadCount > 0 ? (
                    <BellAlertIcon className="h-6 w-6 text-brand-600 animate-pulse" aria-hidden="true" />
                ) : (
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                )}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-96 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            🔔 Notifications
                            {unreadCount > 0 && (
                                <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                            <div className="text-4xl mb-2">🔕</div>
                            <p className="text-sm text-gray-500">No notifications yet</p>
                            <p className="text-xs text-gray-400 mt-1">You'll be notified about new donations and updates</p>
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 border-b border-gray-50 ${getNotificationBgColor(notification.type, notification.read)}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                {notification.message.replace(/^[\u{1F300}-\u{1F9FF}]+\s*/u, '')}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                                <span>{getTimeAgo(notification.createdAt)}</span>
                                                {!notification.read && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
                                                        New
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/dashboard');
                                }}
                                className="w-full text-center text-xs text-brand-600 hover:text-brand-700 font-medium py-1"
                            >
                                View all activity →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
