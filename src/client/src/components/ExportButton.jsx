import React, { useState } from 'react';
import { exportDocument } from '../helpers/auth/auth.helper';

const ExportButton = ({ documentId, title, quillContent }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState('');
  const [showModal, setShowModal] = useState(false);

  const triggerDownload = (data, fileName, format) => {
    const blob = new Blob([data], { type: `application/${format}` });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await exportDocument(documentId, format, quillContent);
      triggerDownload(data, title, format);
      
      setShowModal(false);
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Export Document
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Export Options</h3>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded-md mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select export format</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word Document</option>
            </select>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!format || loading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                  (!format || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {loading ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportButton;