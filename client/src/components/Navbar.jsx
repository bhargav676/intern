import React from 'react';
import { MenuIcon, BellIcon, UserCircleIcon } from './Icons'; // Adjust path if needed

const Navbar = ({ onToggleDeviceList, hasAlerts }) => {
  return (
    <nav className="bg-white border-b border-slate-200 flex-shrink-0 sticky top-0 z-40"> {/* Sticky top and higher z-index */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8"> {/* Slightly more padding */}
        <div className="flex items-center justify-between h-16"> {/* Increased height */}

          {/* Left Section: Menu Toggle & Brand */}
          <div className="flex items-center">
            <button
              onClick={onToggleDeviceList}
              className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden" // Hidden on large screens if sidebar is always visible
              aria-label="Toggle device list"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 ml-3 md:ml-0"> {/* No margin on md+ if hamburger is hidden */}
              <span className="text-xl font-semibold text-blue-600">AquaWatch</span>
            </div>
          </div>

          {/* Center Section: Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
            <a
              href="/#"
              className="text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out"
            >
              Dashboard
            </a>
            <a
              href="/#"
              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out"
            >
              Reports
            </a>
            <a
              href="/#"
              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out"
            >
              Settings
            </a>
          </div>

          {/* Right Section: Notifications & User Menu */}
          <div className="flex items-center space-x-3"> {/* Added space-x for consistent spacing */}
            <button
              type="button"
              className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative transition-colors duration-150 ease-in-out"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" />
              {hasAlerts && (
                <span className="absolute top-0.5 right-0.5 block h-2.5 w-2.5 rounded-full ring-1 ring-white bg-red-500" />
              )}
            </button>

            {/* Profile dropdown (basic button, can be expanded later) */}
            <div className="relative">
              <button
                type="button"
                className="p-0.5 bg-transparent rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                <UserCircleIcon className="h-8 w-8 text-slate-500 hover:text-blue-600 transition-colors duration-150 ease-in-out" />
              </button>
             
              
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
                <a href="/#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem" tabIndex="-1" id="user-menu-item-0">Your Profile</a>
                <a href="/#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem" tabIndex="-1" id="user-menu-item-1">Settings</a>
                <a href="/#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem" tabIndex="-1" id="user-menu-item-2">Sign out</a>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;