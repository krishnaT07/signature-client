import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureBox from '../components/SignatureBox';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const SharedSignPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [docUrl, setDocUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [signature, setSignature] = useState(null);
  const [, setNumPages] = useState(1);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const fetchSharedDoc = async () => {
      try {
        const res = await API.get(`/shared/${token}`);
        const fileUrl = `http://localhost:5000/${res.data.filePath.replace(/\\/g, '/')}`;
        setDocUrl(fileUrl);
      } catch (err) {
        console.error(err);
        setToast({ message: 'Invalid or expired link.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDoc();
  }, [token]);

  const handleDragEnd = (e) => {
    const container = e.target.closest('.pdf-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSignature((prev) => ({
      ...prev,
      x,
      y,
    }));
  };

  const handleFinalize = async () => {
    try {
      await API.post(`/shared/finalize/${token}`, {
        signatureDetails: {
          x: signature.x,
          y: signature.y,
          page: 1,
          text: signature.text,
          fontSize: signature.fontSize,
          fontWeight: signature.fontWeight,
          fontStyle: signature.fontStyle,
          underline: signature.underline,
          fontFamily: signature.fontFamily,
          color: signature.color,
          userAgent: navigator.userAgent,
          ipAddress: 'auto', // or capture from server side
          timestamp: new Date().toISOString(),
        }
      });

      setToast({ message: '✅ Document signed successfully!', type: 'success' });
      setSigned(true);

      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setToast({ message: '❌ Failed to finalize document.', type: 'error' });
    }
  };

  const defaultSignature = {
    id: Date.now(),
    x: 100,
    y: 100,
    page: 1,
    text: 'Signed by Recipient',
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    underline: false,
    fontFamily: 'Cursive',
    color: '#000000',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">📩 Shared Document Sign</h2>
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800"
        >
          🏠 Home
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : docUrl ? (
        <div className="bg-white p-4 rounded shadow">
          <Document file={docUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <div className="relative pdf-container">
              <Page pageNumber={1} width={window.innerWidth < 768 ? 320 : 600} />

              {signature && (
                <SignatureBox
                  {...signature}
                  onDragEnd={handleDragEnd}
                  onUpdate={(data) => setSignature({ ...signature, ...data })}
                />
              )}
            </div>
          </Document>

          <div className="mt-4 space-x-3">
            {!signature && (
              <button
                onClick={() => setSignature(defaultSignature)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ✍️ Add Signature
              </button>
            )}

            {signature && !signed && (
              <button
                onClick={handleFinalize}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✅ Finalize & Sign
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-red-500 text-center">Invalid or expired signing link.</p>
      )}
    </div>
  );
};

export default SharedSignPage;
