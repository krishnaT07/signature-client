import React, { useEffect, useState } from 'react';
import API from '../utils/api';

import Navbar from '../components/Navbar';
import DocCard from '../components/DocCard';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

const Dashboard = () => {
  const [docs, setDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDocuments = async () => {
    try {
      const res = await API.get('/docs');
      setDocs(res.data);
      setFilteredDocs(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to load documents.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredDocs(
      docs.filter(doc =>
        doc.name?.toLowerCase().includes(value) ||
        doc.status?.toLowerCase().includes(value)
      )
    );
  };

  const handleDelete = (deletedId) => {
    const updatedDocs = docs.filter((doc) => doc._id !== deletedId);
    setDocs(updatedDocs);
    setFilteredDocs(updatedDocs.filter(doc =>
      doc.name?.toLowerCase().includes(searchTerm) ||
      doc.status?.toLowerCase().includes(searchTerm)
    ));
    setToast({ message: '🗑️ Document deleted.', type: 'success' });
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const total = docs.length;
  const signed = docs.filter(doc => doc.status === 'signed').length;
  const pending = docs.filter(doc => doc.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navbar />

      <main className="p-6 max-w-7xl mx-auto flex-grow">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">📄 Your Documents</h1>
          <input
            type="text"
            placeholder="🔍 Search documents..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 w-full md:w-80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-sm">📁 Total Documents</p>
            <h2 className="text-3xl font-bold">{total}</h2>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-sm">✅ Signed</p>
            <h2 className="text-3xl font-bold">{signed}</h2>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-sm">🕐 Pending</p>
            <h2 className="text-3xl font-bold">{pending}</h2>
          </div>
        </div>

        {/* Documents */}
        {loading ? (
          <Loader />
        ) : filteredDocs.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">No documents found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <DocCard
                key={doc._id}
                doc={doc}
                onDelete={() => handleDelete(doc._id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-6 mt-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Krishna Thakare. All rights reserved.</p>
          <div className="flex gap-4 text-xl">
            <a
              href="https://github.com/krishnathakare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
              title="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a
              href="https://linkedin.com/in/krishnathakare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
              title="LinkedIn"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a
              href="https://instagram.com/krishnathakare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
              title="Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

