// src/components/Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <div
          onClick={() => navigate('/dashboard')}
          className="text-2xl font-bold tracking-wide cursor-pointer hover:text-gray-200 transition"
        >
          DocuSign<span className="text-yellow-400">Pro</span>
        </div>

        {/* Nav Buttons */}
        <div className="space-x-4">
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 rounded bg-white text-blue-700 font-semibold hover:bg-gray-100 transition"
          >
            Upload
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded border border-white hover:bg-white hover:text-red-600 font-semibold transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
