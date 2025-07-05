import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import Toast from '../components/Toast';
import SignatureBox from '../components/SignatureBox';
import Loader from '../components/Loader';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

// ✅ Backend URL (dynamic for dev/prod)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://signature-server-5olu.onrender.com';

const DocView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [docUrl, setDocUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [signatures, setSignatures] = useState([]);
  const [finalPdfBlob, setFinalPdfBlob] = useState(null);

  // ✅ Fetch Document on Load
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await API.get(`/docs/${id}`);
        setDocUrl(`${BASE_URL}/${res.data.filePath.replace(/\\/g, '/')}`);
      } catch (err) {
        console.error('Error fetching document:', err);
        setToast({ message: 'Failed to load document.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const addSignature = () => {
    setSignatures((prev) => [
      ...prev,
      {
        id: Date.now(),
        x: 100,
        y: 100,
        page: currentPage,
        text: 'Add Signature',
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
    setSignatures((prev) => prev.map((sig) => (sig.id === id ? { ...sig, ...newData } : sig)));
  };

  const deleteSignature = (id) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveSignature = async () => {
    try {
      for (const sig of signatures) {
        await API.post('/signatures', {
          documentId: id,
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
        });
      }

      setToast({ message: 'Signatures saved.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to save signatures.', type: 'error' });
    }
  };

  const handleFinalizePDF = async () => {
    try {
      const res = await API.post(
        '/signatures/finalize',
        { documentId: id },
        { responseType: 'blob' }
      );

      const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
      setFinalPdfBlob(pdfBlob);
      setToast({ message: 'PDF finalized and ready to download.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error finalizing PDF.', type: 'error' });
    }
  };

  const handleDownload = () => {
    if (!finalPdfBlob) return;

    const blobURL = window.URL.createObjectURL(finalPdfBlob);
    const link = document.createElement('a');
    link.href = blobURL;
    link.download = `signed_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobURL);
  };

  const handleDragEnd = (e, id) => {
    const container = e.target.closest('.pdf-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    updateSignature(id, { x, y });
  };

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(numPages, prev + 1));

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📄 Document Viewer</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🏠 Home
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : docUrl ? (
        <div className="bg-white p-4 sm:p-6 border rounded-lg shadow">
          <Document file={docUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <div className="relative border border-gray-300 rounded-lg shadow-sm pdf-container bg-gray-50 p-2 sm:p-4 overflow-auto">
              <Page
                pageNumber={currentPage}
                width={window.innerWidth < 768 ? 320 : 600}
              />

              {signatures
                .filter((s) => s.page === currentPage)
                .map((sig) => (
                  <SignatureBox
                    key={sig.id}
                    {...sig}
                    onDragEnd={(e) => handleDragEnd(e, sig.id)}
                    onUpdate={(data) => updateSignature(sig.id, data)}
                    onDelete={() => deleteSignature(sig.id)} // ✅ Pass delete function
                  />
                ))}
            </div>
          </Document>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-4 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded disabled:opacity-50"
            >
              ← Prev
            </button>

            <span className="text-gray-600">
              Page {currentPage} of {numPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === numPages}
              className="px-4 py-1 bg-gray-300 hover:bg-gray-400 text-sm rounded disabled:opacity-50"
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
              onClick={handleSaveSignature}
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
            >
              💾 Save Signatures
            </button>

            <button
              onClick={handleFinalizePDF}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✅ Finalize PDF
            </button>

            {finalPdfBlob && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                ⬇️ Download PDF
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-red-500">No document found.</p>
      )}
    </div>
  );
};

export default DocView;



