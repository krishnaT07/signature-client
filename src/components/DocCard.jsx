import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import API from '../utils/api';
import StatusBadge from './StatusBadge';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

// ✅ Set base URL based on environment
const BASE_URL = import.meta.env.VITE_API_BASE_URL

const DocCard = ({ doc, onDelete }) => {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const handleDownload = () => {
    if (doc.finalPath) {
      const url = `${BASE_URL}/${doc.finalPath.replace(/\\/g, '/')}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name || doc.originalName || 'document.pdf';
      link.click();
    }
  };

  const handleInfo = async () => {
    try {
      setLoadingAudit(true);
      const res = await API.get(`/signatures/${doc._id}`);
      setAuditData(res.data);
      setShowAuditModal(true);
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
      alert('❌ Failed to fetch audit trail');
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSendShareEmail = async () => {
    try {
      const link = `${window.location.origin}/docs/${doc._id}`;
      const res = await API.post('/email/share', { email: shareEmail, link });

      alert(`📤 ${res.data.message || 'Email sent!'}`);
      setShowShareModal(false);
      setShareEmail('');
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('❌ Failed to send email');
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm('🗑️ Are you sure you want to delete this document?');
    if (!confirm) return;

    try {
      await API.delete(`/docs/${doc._id}`);
      onDelete(); // Notify parent
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('❌ Failed to delete document.');
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between min-h-[240px]">
        <div className="mb-3">
          <h2 className="text-lg font-bold text-gray-800 truncate">{doc.name || doc.originalName}</h2>
          <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
            <span>📅 {new Date(doc.createdAt).toLocaleDateString()}</span>
            {doc.status && <StatusBadge status={doc.status} />}
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-800"
            >
              👁 Preview
            </button>
            <button
              onClick={() => navigate(`/docs/${doc._id}`)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
            >
              ✍️ Sign
            </button>
          </div>

          <div className="flex gap-3 text-xl items-center">
            {doc.finalPath && (
              <button onClick={handleDownload} title="Download PDF" className="hover:text-green-600 transition">
                ⬇️
              </button>
            )}
            <button onClick={() => setShowShareModal(true)} title="Share" className="hover:text-yellow-600">✉️</button>
            <button onClick={handleInfo} title="Audit Trail" className="hover:text-blue-600">ℹ️</button>
            <button onClick={handleDelete} title="Delete" className="hover:text-red-500">🗑️</button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-5 relative max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">📄 PDF Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-red-500 text-xl">✖</button>
            </div>

            <Document
              file={`${BASE_URL}/${doc.filePath.replace(/\\/g, '/')}`}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from(new Array(numPages), (_, i) => (
                <Page
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  width={window.innerWidth < 768 ? 300 : 600}
                  className="mb-4 border"
                />
              ))}
            </Document>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">📤 Share Document</h3>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter recipient email"
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowShareModal(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Cancel</button>
              <button onClick={handleSendShareEmail} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">📜 Audit Trail</h3>
              <button onClick={() => setShowAuditModal(false)} className="text-gray-500 hover:text-red-600 text-xl">✖</button>
            </div>

            {loadingAudit ? (
              <p className="text-gray-500">Loading...</p>
            ) : auditData.length === 0 ? (
              <p className="text-gray-500">No signatures found.</p>
            ) : (
              <ul className="space-y-4 text-sm">
                {auditData.map((sig) => (
                  <li key={sig._id} className="border-b pb-3">
                    <p>👤 <b>Signed By:</b> {sig.email || 'Anonymous'}</p>
                    <p>🕒 <b>Time:</b> {new Date(sig.signedAt).toLocaleString()}</p>
                    <p>📄 <b>Page:</b> {sig.page}, 🖋️ <b>Text:</b> {sig.text || 'Image Signature'}</p>
                    <p>🌐 <b>IP:</b> {sig.ipAddress || 'N/A'}</p>
                    <p>🧭 <b>Device:</b> {sig.userAgent || 'N/A'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DocCard;


