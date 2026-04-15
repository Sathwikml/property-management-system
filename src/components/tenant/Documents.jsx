import { useState, useEffect, useRef } from 'react';
import { documentApi } from '../../api/documentApi';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const fileInputRef = useRef(null);

  const ALLOWED_FILE_TYPES = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentApi.getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch documents error:', error);
      setError('Failed to load documents');
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const getFileExtension = (fileName) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const validateFile = (file) => {
    if (!file) {
      toast.error('No file selected');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    const ext = getFileExtension(file.name);
    if (!ALLOWED_FILE_TYPES.includes(ext)) {
      toast.error(`Invalid file type. Allowed: ${ALLOWED_FILE_TYPES.join(', ')}`);
      return false;
    }

    if (!file.name || file.name.trim() === '') {
      toast.error('Invalid file name');
      return false;
    }

    return true;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'OTHER');
      formData.append('name', file.name);

      await documentApi.uploadDocument(formData);
      toast.success('Document uploaded successfully');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload document');
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    if (!doc || !doc.id || !doc.name) {
      toast.error('Invalid document');
      return;
    }

    try {
      const blob = await documentApi.downloadDocument(doc.id);

      if (!blob || blob.size === 0) {
        toast.error('Downloaded file is empty');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name || 'document';
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);

      toast.success('Document downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (docId) => {
    if (!docId) {
      toast.error('Invalid document ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentApi.deleteDocument(docId);
      toast.success('Document deleted');
      await fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const filteredDocuments = filterType === 'ALL' 
    ? documents 
    : documents.filter(doc => doc.type === filterType);

  const uniqueDocTypes = [...new Set(documents.map(doc => doc.type).filter(Boolean))];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Documents</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and organize your documents
          </p>
        </div>
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Document
            </>
          )}
        </label>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          aria-label="Upload document"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* File Type Filter */}
      {documents.length > 0 && uniqueDocTypes.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filterType === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All ({documents.length})
          </button>
          {uniqueDocTypes.map(type => {
            const count = documents.filter(doc => doc.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {type?.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium">No documents yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Upload your first document to get started
          </p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600">No documents found for this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download document"
                    aria-label="Download document"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete document"
                    aria-label="Delete document"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate break-words">
                  {doc.name || 'Unnamed Document'}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {doc.type?.replace(/_/g, ' ') || 'Unknown Type'}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(doc.uploadedAt || doc.createdAt || new Date())}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Info */}
      {documents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} uploaded
            {filteredDocuments.length !== documents.length && ` (${filteredDocuments.length} shown)`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Documents;
