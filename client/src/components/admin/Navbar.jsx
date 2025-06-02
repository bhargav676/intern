import React, { useState, useEffect } from 'react';
import { HiMenu, HiBell, HiUserCircle, HiSun, HiMoon, HiSearch, HiPlus, HiLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Backend WebSocket connection

const Navbar = ({ onToggleDeviceList, hasAlerts, isDarkMode, setIsDarkMode }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState('healthy'); // Example: 'healthy', 'warning', 'error'
  const [isScrolled, setIsScrolled] = useState(false); // For scroll effect
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial notifications and system status
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/notifications', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setNotifications(response.data.slice(0, 5)); // Limit to 5 recent notifications
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();

    // Simulate system status check
    const checkSystemStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/system-status', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSystemStatus(response.data.status);
      } catch (error) {
        setSystemStatus('error');
      }
    };
    checkSystemStatus();

    // Real-time notifications via WebSocket
    socket.on('newAlert', (alert) => {
      setNotifications((prev) => [alert, ...prev].slice(0, 5));
    });

    return () => socket.off('newAlert');
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/devices?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    socket.disconnect();
    navigate('/login');
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Notification item component
  const NotificationItem = ({ alert }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start p-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
    >
      <span className={`w-2 h-2 rounded-full mt-2 mr-2 ${alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
      <div>
        <p className={`text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{alert.message}</p>
        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {new Date(alert.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
        </p>
      </div>
    </motion.div>
  );

  return (
    <nav
      className={`sticky top-0 z-50 flex-shrink-0 transition-all duration-300 ${
        isScrolled
          ? isDarkMode
            ? 'bg-slate-800/90 border-b border-slate-700'
            : 'bg-white/90 border-b border-slate-200'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Menu Toggle & Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleDeviceList}
              className="p-2 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              aria-label="Toggle device list"
            >
              <HiMenu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex-shrink-0"
              >
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
                  AquaMonitor
                </span>
              </motion.div>
              {/* System Status Indicator */}
              <span
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                  systemStatus === 'healthy'
                    ? 'bg-green-100 text-green-800'
                    : systemStatus === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                System: {systemStatus.charAt(0).toUpperCase() + systemStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Center Section: Navigation & Search */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 w-64 rounded-full text-sm border ${
                  isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-700'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              />
              <HiSearch className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            </form>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {[
                { name: 'Dashboard', href: '/admin', icon: 'DashboardIcon' },
                { name: 'Devices', href: '/admin/devices', icon: 'DeviceIcon' },
                { name: 'Reports', href: '/admin/reports', icon: 'ReportIcon' },
                { name: 'Users', href: '/admin/users', icon: 'UsersIcon' },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors duration-150 ${
                    isDarkMode
                      ? 'text-slate-300 hover:text-blue-400 hover:bg-slate-700'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right Section: Notifications, Quick Actions, Theme Toggle & User Menu */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <div className="relative">
              <button
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                className={`p-2 rounded-full ${
                  isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-blue-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label="Quick actions"
              >
                <HiPlus className="h-6 w-6" />
              </button>
              <AnimatePresence>
                {isQuickActionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    } border z-50`}
                  >
                    <button
                      onClick={() => navigate('/admin/devices/new')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Add Device
                    </button>
                    <button
                      onClick={() => navigate('/admin/users/new')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Add User
                    </button>
                    <button
                      onClick={() => navigate('/admin/reports/generate')}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Generate Report
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                  setIsQuickActionsOpen(false);
                }}
                className={`p-2 rounded-full relative ${
                  isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-blue-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label="View notifications"
              >
                <HiBell className="h-6 w-6" />
                {hasAlerts && (
                  <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white" />
                )}
              </button>
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-1 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    } border z-50`}
                  >
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((alert) => <NotificationItem key={alert.id} alert={alert} />)
                    ) : (
                      <p className="px-4 py-2 text-sm text-slate-500">No new notifications</p>
                    )}
                    <a
                      href="/admin/notifications"
                      className={`block px-4 py-2 text-sm text-center ${
                        isDarkMode
                          ? 'text-blue-400 hover:bg-slate-700'
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      View All
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-blue-50'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <HiSun className="h-6 w-6" /> : <HiMoon className="h-6 w-6" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                  setIsQuickActionsOpen(false);
                }}
                className={`p-1 rounded-full flex items-center ${
                  isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-blue-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <HiUserCircle className="h-8 w-8" />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    } border z-50`}
                  >
                    <a
                      href="/admin/profile"
                      className={`block px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Your Profile
                    </a>
                    <a
                      href="/admin/settings"
                      className={`block px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      System Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-red-700/30'
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;