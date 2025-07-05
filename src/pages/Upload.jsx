import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!docName.trim()) {
      setToast({ message: '⚠️ Please enter a document name.', type: 'error' });
      return;
    }

    if (!file) {
      setToast({ message: '⚠️ Please select a PDF file to upload.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', docName);

    try {
      setLoading(true);
      const res = await API.post('/docs/upload', formData);
      console.log('✅ Uploaded:', res.data);
      setToast({ message: '✅ Upload successful!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('❌ Upload error:', err);
      setToast({ message: '❌ Upload failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navbar />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-lg transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">
            📤 Upload PDF
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Enter a document name and select a PDF to upload.
          </p>

          {loading ? (
            <Loader />
          ) : (
            <form onSubmit={handleUpload} className="space-y-5">
              {/* Document Name */}
              <div>
                <label
                  htmlFor="docName"
                  className="block text-sm font-medium text-slate-700"
                >
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="docName"
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. July Invoice"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* PDF File Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Select PDF File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 
                  file:bg-blue-600 file:text-white file:rounded file:px-4 file:py-2"
                />
              </div>

              {/* Upload Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg text-white shadow transition-all ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Uploading...' : 'Upload Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
