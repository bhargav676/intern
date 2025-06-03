import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell } from 'lucide-react';
import { FaDroplet } from "react-icons/fa6";
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ username: 'Loading...', email: '', role: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserDetails({
        username: payload.username || 'User',
        email: payload.email || 'user@example.com',
        role: payload.role || 'Admin'
      });
    } catch (err) {
      console.error('Error decoding token:', err);
      setError('Failed to load user details');
      setUserDetails({
        username: 'JohnDoe',
        email: 'johndoe@example.com',
        role: 'Admin'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessId');
    navigate('/login');
  };

  const handleAddUserClick = () => {
    navigate('/adduser');
  };

  const handleDeleteUserClick = () => {
    navigate('/deleteuser');
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button onClick={handleLogout} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Log Out
        </button>
      </div>
    );
  }

  return (
    <nav className="fixed top-4 left-4 right-4 bg-black/70 backdrop-blur-md text-white px-4 py-3 rounded-lg flex justify-between items-center z-50">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-md">
          <FaDroplet className="w-8 h-8 text-blue-800"/>
        </div>
        <h1 className="text-xl font-semibold">AquaMonitor</h1>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm relative cursor-pointer after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">Dashboard</span>
        <span className="text-sm relative cursor-pointer after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full">About Us</span>
        {/* Removed "Devices" link since panel is fixed */}
        {userDetails.role === 'admin' && (
          <>
            <span 
              className="text-sm relative cursor-pointer after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              onClick={handleAddUserClick}
            >
              Add New User
            </span>
            <span 
              className="text-sm relative cursor-pointer after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              onClick={handleDeleteUserClick}
            >
              Delete User
            </span>
          </>
        )}
        <button
          onClick={() => {}}
          className="p-2 hover:bg-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Bell className="w-6 h-6" />
        </button>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
          >
            <User className="w-6 h-6" />
          </button>
          {isMenuOpen && (
            <div className="absolute top-12 right-0 bg-black/90 text-white rounded-md shadow-md z-60 w-64 mt-3">
              <div className="px-4 py-3 border-b border-white/20">
                <p className="text-sm font-semibold">{userDetails.username}</p>
                <p className="text-xs text-white/70 mt-1">{userDetails.email}</p>
                <p className="text-xs text-white/70 mt-1">Role: {userDetails.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-600 rounded-b-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;