import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../utils/api';
import { Document, Page, pdfjs } from 'react-pdf';

// Set the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

// ✅ Backend base URL
const BASE_URL = 'https://signature-server-5olu.onrender.com';

const SignShared = () => {
  const { token } = useParams();
  const [docUrl, setDocUrl] = useState('');
  const [error, setError] = useState('');
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await API.get(`/shared/${token}`);
        const filePath = res.data.filePath.replace(/\\/g, '/');
        setDocUrl(`${BASE_URL}/${filePath}`);
      } catch (err) {
        console.error('Link error:', err);
        setError('❌ This signing link is invalid or expired.');
      }
    };

    fetchDocument();
  }, [token]);

  const handleFinalize = async () => {
    try {
      setLoading(true);

      await API.post(`/shared/finalize/${token}`, {
        signatureDetails: {
          x: 100,
          y: 100,
          page: 1,
          text: 'Signed by Recipient',
          fontSize: 16,
          fontWeight: 'bold',
          fontStyle: 'italic',
          fontFamily: 'Cursive',
          color: '#000000',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          ipAddress: 'auto',
        },
      });

      setSigned(true);
    } catch (err) {
      console.error('Finalize error:', err);
      setError('❌ Failed to finalize and sign the document.');
    } finally {
      setLoading(false);
    }
  };

  // Error state
  if (error) {
    return (
      <p className="text-red-600 text-center mt-10 text-lg font-medium">
        {error}
      </p>
    );
  }

  // Signed success
  if (signed) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-green-600 text-2xl font-semibold">✅ PDF Signed Successfully!</h2>
        <p className="text-gray-700 mt-2">You may now close this window or return to the app.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📄 Review & Sign Document</h2>

      {docUrl ? (
        <div className="inline-block bg-white p-4 rounded shadow max-w-full overflow-x-auto">
          <Document file={docUrl}>
            <Page
              pageNumber={1}
              width={window.innerWidth < 768 ? 320 : 600}
              className="border"
            />
          </Document>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">Loading PDF...</p>
      )}

      <button
        onClick={handleFinalize}
        disabled={loading}
        className={`mt-6 px-6 py-2 rounded text-white font-semibold transition ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Signing...' : '✅ Finalize & Sign'}
      </button>
    </div>
  );
};

export default SignShared;



