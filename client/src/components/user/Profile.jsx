import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import { FaUser, FaEnvelope, FaShieldAlt, FaEdit } from 'react-icons/fa';

const socket = io(`${import.meta.env.VITE_API_URL}`, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const Profile = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const isDarkMode = context?.isDarkMode ?? false;
  const formatTimestampToIST = context?.formatTimestampToIST ?? ((ts) => (ts ? new Date(ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A'));
  const pageUsername = context?.username || 'User';

  const [profile, setProfile] = useState({ username: '', email: '', role: '' });
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTimeout, setIsTimeout] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setIsTimeout(false);
      setError(null);
      try {
        const [profileRes, devicesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => {
            throw new Error(`Profile fetch failed: ${err.response?.status} ${err.response?.data?.message || err.message}`);
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/user/sensor/data?latest=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(err => {
            throw new Error(`Devices fetch failed: ${err.response?.status} ${err.response?.data?.message || err.message}`);
          }),
        ]);
        setProfile({
          username: profileRes.data.username || 'User',
          email: profileRes.data.email || 'N/A',
          role: profileRes.data.role || 'N/A',
        });
        setDevices(devicesRes.data || []);
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to load profile: ${err.message}`, { theme: isDarkMode ? 'dark' : 'light' });
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };
    fetchProfile();

    socket.on('connect', () => {});
    socket.on('disconnect', () => {});
    socket.on('sensorDataUpdate', (data) => {
      try {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return;
        const decodedToken = JSON.parse(atob(currentToken.split('.')[1]));
        const userIdFromToken = decodedToken.userId || decodedToken.id;
        if (data.userId === userIdFromToken) {
          setDevices((prev) => {
            const updated = prev.filter((d) => d.deviceId !== data.deviceId);
            updated.push({ ...data, name: data.deviceId, status: 'Online' });
            return updated;
          });
        }
      } catch (error) {}
    });

    timeoutId = setTimeout(() => {
      if (loading) {
        setIsTimeout(true);
        setLoading(false);
        setError('Request timed out');
        toast.warn('Loading is taking longer than expected. Please try again later.', { theme: isDarkMode ? 'dark' : 'light' });
      }
    }, 5000);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('sensorDataUpdate');
      clearTimeout(timeoutId);
    };
  }, [navigate, isDarkMode]);

  const handleRetry = () => {
    setLoading(true);
    setIsTimeout(false);
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="loader">
          <div className="loader-circle"></div>
          <span className="text-xl font-medium text-cyan-500 mt-4">Loading Profile...</span>
        </div>
        <style jsx>{`
          .loader {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .loader-circle {
            width: 60px;
            height: 60px;
            border: 8px solid #06b6d4;
            border-top: 8px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isTimeout || error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="card bg-white shadow-xl p-8 rounded-2xl">
          <p className="text-lg font-semibold text-cyan-500 mb-4">Failed to load profile: {error || 'Please try again later.'}</p>
          <button 
            className="uiverse-btn" 
            onClick={handleRetry}
          >
            Retry
            <span className="uiverse-btn-circle"></span>
            <span className="uiverse-btn-icon">
              <i className="fas fa-redo"></i>
            </span>
          </button>
          <style jsx>{`
            .card {
              background: #fff;
              box-shadow: 5px 10px 20px rgba(0,0,0,0.08);
              border-radius: 16px;
              padding: 2rem;
            }
            .uiverse-btn {
              position: relative;
              padding: 10px 30px;
              font-size: 14px;
              font-weight: 500;
              color: #fff;
              background: linear-gradient(to right, #06b6d4, #22d3ee);
              border: none;
              border-radius: 8px;
              cursor: pointer;
              overflow: hidden;
              transition: all 0.3s ease;
            }
            .uiverse-btn:hover {
              background: linear-gradient(to right, #22d3ee, #06b6d4);
              transform: translateY(-2px);
            }
            .uiverse-btn-circle {
              position: absolute;
              width: 100px;
              height: 100px;
              background: rgba(255,255,255,0.3);
              border-radius: 50%;
              transform: translate(-50%, -50%) scale(0);
              animation: scale 0.5s ease-out;
            }
            .uiverse-btn-icon {
              margin-left: 8px;
            }
            @keyframes scale {
              0% { transform: translate(-50%, -50%) scale(0); }
              100% { transform: translate(-50%, -50%) scale(1); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-white">
      <ToastContainer
        newestOnTop
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme={isDarkMode ? 'dark' : 'light'}
      />
      <div className="absolute inset-0"></div>
      <div className="relative z-10 px-4 sm:px-6 lg:px-20 py-8">
        <div className="max-w-4xl mx-auto mb-8 mt-20">
          <h1 className="text-4xl font-bold text-cyan-500 mb-2">Welcome, {pageUsername}</h1>
          <p className="text-lg text-cyan-500">Manage your profile and IoT devices for the Water Quality Monitoring System.</p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="card bg-white shadow-2xl rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-cyan-500">Profile Details</h2>
              <button
                className="uiverse-btn uiverse-btn-small"
                onClick={() => toast.info('Edit profile feature coming soon!', { theme: isDarkMode ? 'dark' : 'light' })}
              >
                <FaEdit className="mr-2" /> Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="profile-item flex items-center">
                <FaUser className="text-2xl text-cyan-500 mr-3" />
                <div>
                  <p className="text-sm font-semibold text-gray-500">Username</p>
                  <p className="text-md text-cyan-500">{profile.username}</p>
                </div>
              </div>
              <div className="profile-item flex items-center">
                <FaEnvelope className="text-2xl text-cyan-500 mr-3" />
                <div>
                  <p className="text-sm font-semibold text-gray-500">Email</p>
                  <p className="text-md text-cyan-500">{profile.email}</p>
                </div>
              </div>
              <div className="profile-item flex items-center">
                <FaShieldAlt className="text-2xl text-cyan-500 mr-3" />
                <div>
                  <p className="text-sm font-semibold text-gray-500">Role</p>
                  <p className="text-md text-cyan-500">{profile.role}</p>
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            .card {
              position: relative;
              background: #fff;
              border-radius: 16px;
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.10);
              overflow: hidden;
              transition: transform 0.3s ease;
            }
            .profile-item {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px;
              background: #f9fafb;
              border-radius: 8px;
              transition: transform 0.2s ease;
            }
            .profile-item:hover {
              transform: translateY(-3px);
              background: #fff;
            }
            .uiverse-btn {
              position: relative;
              padding: 12px 30px;
              font-size: 14px;
              font-weight: 500;
              color: #fff;
              background: linear-gradient(to right, #06b6d4, #22d3ee);
              border: none;
              border-radius: 12px;
              cursor: pointer;
              overflow: hidden;
              display: inline-flex;
              align-items: center;
              transition: all 0.3s ease;
            }
            .uiverse-btn:hover {
              background: linear-gradient(to right, #22d3ee, #06b6d4);
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            .uiverse-btn-small {
              padding: 8px 16px;
              font-size: 12px;
            }
            .uiverse-btn-circle {
              position: absolute;
              width: 100px;
              height: 100px;
              background: rgba(255,255,255,0.3);
              border-radius: 50%;
              transform: scale(0);
              animation: scale 0.5s ease-out;
            }
            .uiverse-btn-icon {
              margin-left: 8px;
            }
            @keyframes scale {
              0% { transform: scale(0); }
              100% { transform: scale(1); }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default Profile;