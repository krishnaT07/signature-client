import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import DocView from './pages/DocView';
import SharedDoc from './pages/SharedDoc';
import SharedSignPage from './pages/SharedSignPage';
import SharedDocView from './pages/SharedDocView';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Auth Pages */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main App Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/docs/:id" element={<DocView />} />

        {/* Shared Document Routes */}
        <Route path="/shared/view/:token" element={<SharedDoc />} />           {/* read-only preview */}
        <Route path="/shared/sign/:token" element={<SharedSignPage />} />      {/* single page quick sign */}
        <Route path="/shared/viewer/:token" element={<SharedDocView />} />     {/* rich viewer with editor/sign */}
      </Routes>
    </div>
  );
}

export default App;
