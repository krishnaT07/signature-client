import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import API from '../utils/api';
import Toast from '../components/Toast';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

// ✅ Backend URL
const baseURL = 'https://signature-server-5olu.onrender.com';

const SharedDoc = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [fileUrl, setFileUrl] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [signatureDetails, setSignatureDetails] = useState({
    x: 100,
    y: 100,
    page: 1,
    text: 'Signed by guest',
    fontSize: 16,
    color: '#000000',
  });

  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');
  const [finalized, setFinalized] = useState(false);

  // ✅ Load PDF from token
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await API.get(`/shared/${token}`);
        if (res.data?.filePath) {
          setFileUrl(`${baseURL}/${res.data.filePath.replace(/\\/g, '/')}`);
        } else {
          setError('❌ No file found.');
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        setError('❌ Invalid or expired link.');
      }
    };

    verifyToken();
  }, [token]);

  // ✅ Finalize signature
  const handleFinalize = async () => {
    try {
      await API.post(`/shared/finalize/${token}`, { signatureDetails });
      setToast({ message: '✅ Document signed successfully.', type: 'success' });
      setFinalized(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Finalize error:', err);
      setToast({ message: '❌ Failed to finalize.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">📄 Shared Document</h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {fileUrl && !error && (
        <>
          <div className="bg-white border rounded-lg p-4 shadow max-w-3xl w-full overflow-auto">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from(new Array(numPages), (_, i) => (
                <Page
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  width={window.innerWidth < 768 ? 320 : 600}
                  className="mb-4"
                />
              ))}
            </Document>
          </div>

          {!finalized && (
            <div className="mt-6 max-w-lg w-full bg-white p-4 rounded shadow space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">✍️ Sign Document</h3>
              <input
                type="text"
                value={signatureDetails.text}
                onChange={(e) => setSignatureDetails({ ...signatureDetails, text: e.target.value })}
                className="w-full border px-3 py-2 rounded focus:outline-none"
                placeholder="Your signature text"
              />
              <input
                type="number"
                value={signatureDetails.page}
                onChange={(e) =>
                  setSignatureDetails({ ...signatureDetails, page: parseInt(e.target.value) || 1 })
                }
                min={1}
                max={numPages}
                className="w-full border px-3 py-2 rounded"
                placeholder="Page number"
              />
              <input
                type="number"
                value={signatureDetails.x}
                onChange={(e) =>
                  setSignatureDetails({ ...signatureDetails, x: parseInt(e.target.value) || 0 })
                }
                className="w-full border px-3 py-2 rounded"
                placeholder="X position"
              />
              <input
                type="number"
                value={signatureDetails.y}
                onChange={(e) =>
                  setSignatureDetails({ ...signatureDetails, y: parseInt(e.target.value) || 0 })
                }
                className="w-full border px-3 py-2 rounded"
                placeholder="Y position"
              />
              <input
                type="color"
                value={signatureDetails.color}
                onChange={(e) => setSignatureDetails({ ...signatureDetails, color: e.target.value })}
                className="w-full"
              />
              <button
                onClick={handleFinalize}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                ✅ Finalize & Sign
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SharedDoc;


