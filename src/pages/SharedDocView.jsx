import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import Loader from '../components/Loader';
import SignatureBox from '../components/SignatureBox';
import Toast from '../components/Toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

// ✅ Your Deployed Backend URL
const BASE_URL = 'https://signature-server-5olu.onrender.com';

const SharedDocView = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [docUrl, setDocUrl] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [toast, setToast] = useState(null);
  const [isUsed, setIsUsed] = useState(false);

  useEffect(() => {
    const fetchSharedDoc = async () => {
      try {
        const res = await API.get(`/shared/${token}`);
        const filePath = res.data.filePath;
        setDocumentId(res.data.documentId);
        setDocUrl(`${BASE_URL}/${filePath.replace(/\\/g, '/')}`);
      } catch (err) {
        console.error('Token validation error:', err);
        setIsUsed(true);
        setToast({ message: '❌ Invalid or expired link.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDoc();
  }, [token]);

  const addSignature = () => {
    setSignatures((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: 100,
        y: 100,
        page: currentPage,
        text: 'Signature',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        underline: false,
        fontFamily: 'Arial',
        color: '#000000',
      },
    ]);
  };

  const updateSignature = (id, newData) => {
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === id ? { ...sig, ...newData } : sig))
    );
  };

  const handleDragEnd = (e, id) => {
    const container = e.target.closest('.pdf-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateSignature(id, { x, y });
  };

  const handleFinalize = async () => {
    if (!signatures.length) {
      setToast({ message: '⚠️ Please add a signature first.', type: 'warning' });
      return;
    }

    try {
      for (const sig of signatures) {
        await API.post('/signatures', {
          documentId,
          x: sig.x,
          y: sig.y,
          page: sig.page,
          status: 'signed',
          imageData: null,
          text: sig.text,
          fontSize: sig.fontSize,
          fontWeight: sig.fontWeight,
          fontStyle: sig.fontStyle,
          underline: sig.underline,
          fontFamily: sig.fontFamily,
          color: sig.color,
          signedBy: 'guest',
          ipAddress: 'auto',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        });
      }

      await API.post(`/shared/finalize/${token}`, {
        signatureDetails: signatures[0],
      });

      setToast({ message: '✅ Document signed and finalized!', type: 'success' });
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Finalize error:', err);
      setToast({ message: '❌ Failed to finalize document.', type: 'error' });
    }
  };

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(numPages, prev + 1));

  if (loading) return <Loader />;

  if (isUsed) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">❌ Link Expired or Invalid</h2>
        <p className="mt-2 text-gray-700">This document is no longer accessible.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📄 Sign Shared Document</h2>
        <span className="text-sm text-gray-600">Token: {token.slice(0, 8)}...</span>
      </div>

      <div className="bg-white p-4 border rounded shadow">
        <Document file={docUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
          <div className="relative pdf-container border rounded bg-gray-50">
            <Page
              pageNumber={currentPage}
              width={window.innerWidth < 768 ? 300 : 600}
            />

            {signatures
              .filter((s) => s.page === currentPage)
              .map((sig) => (
                <SignatureBox
                  key={sig.id}
                  {...sig}
                  onDragEnd={(e) => handleDragEnd(e, sig.id)}
                  onUpdate={(data) => updateSignature(sig.id, data)}
                  onDelete={() =>
                    setSignatures((prev) => prev.filter((s) => s.id !== sig.id))
                  }
                />
              ))}
          </div>
        </Document>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="px-4 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
          >
            ← Previous
          </button>

          <span>Page {currentPage} of {numPages}</span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === numPages}
            className="px-4 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={addSignature}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Signature
          </button>

          <button
            onClick={handleFinalize}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ✅ Finalize & Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedDocView;
