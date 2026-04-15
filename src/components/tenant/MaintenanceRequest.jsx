import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { maintenanceApi } from '../../api/maintenanceApi';
import { getStatusColor, getPriorityColor, getRelativeTime } from '../../utils/helpers';
import { MAINTENANCE_PRIORITY } from '../../utils/constants';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';
import Modal from '../common/Modal';

const MaintenanceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const objectUrlsRef = useRef([]);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
      priority: '',
      category: ''
    }
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxFiles: 5,
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        toast.error('Some files were rejected. Check file size and format.');
      }
      setUploadedImages(prev => [...prev, ...acceptedFiles]);
    }
  });

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await maintenanceApi.getTenantRequests();
      setRequests(data || []);
    } catch (error) {
      console.error('Failed to load maintenance requests:', error);
      toast.error('Failed to load maintenance requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!data.title?.trim() || !data.description?.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('description', data.description.trim());
      formData.append('priority', data.priority);
      formData.append('category', data.category);

      uploadedImages.forEach((file) => {
        formData.append('images', file);
      });

      await maintenanceApi.createRequest(formData);
      toast.success('Maintenance request submitted successfully');
      
      // Reset form and cleanup
      reset();
      setUploadedImages([]);
      setShowForm(false);
      await fetchRequests();
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const removeImage = (index) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    reset();
    setUploadedImages([]);
  };

  const getImagePreviewUrl = (file) => {
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    return url;
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance Requests</h2>
          <p className="text-gray-600">Submit and track your maintenance requests</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary flex items-center"
          aria-label="Create new maintenance request"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Open</p>
          <p className="text-2xl font-bold text-blue-600">
            {requests.filter(r => r.status === 'OPEN').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">
            {requests.filter(r => r.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {requests.filter(r => r.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance requests yet</h3>
          <p className="text-gray-600 mb-4">Submit your first maintenance request</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Create Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span>Category: {request.category}</span>
                    <span>•</span>
                    <span>{getRelativeTime(request.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Images */}
              {request.imageUrls && request.imageUrls.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {request.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => window.open(url, '_blank')}
                      className="relative group"
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={url}
                        alt={`Issue ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-lg hover:opacity-75 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Progress Indicator */}
              {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">
                      {request.status === 'OPEN' ? '0%' : request.status === 'IN_PROGRESS' ? '50%' : '100%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: request.status === 'OPEN' ? '0%' : request.status === 'IN_PROGRESS' ? '50%' : '100%'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Comments */}
              {request.comments && request.comments.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Updates ({request.comments.length})
                  </p>
                  <div className="space-y-2">
                    {request.comments.slice(-2).map((comment, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-500">{getRelativeTime(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Request Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title="Submit Maintenance Request"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 100, message: 'Title must not exceed 100 characters' }
              })}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Leaking faucet in kitchen"
              aria-invalid={errors.title ? 'true' : 'false'}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 1000, message: 'Description must not exceed 1000 characters' }
              })}
              className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              rows="4"
              placeholder="Describe the issue in detail..."
              aria-invalid={errors.description ? 'true' : 'false'}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                {...register('priority', { required: 'Priority is required' })}
                className={`input-field ${errors.priority ? 'border-red-500' : ''}`}
                aria-invalid={errors.priority ? 'true' : 'false'}
              >
                <option value="">Select priority</option>
                {Object.values(MAINTENANCE_PRIORITY).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
              {errors.priority && <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                {...register('category', { required: 'Category is required' })}
                className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                aria-invalid={errors.category ? 'true' : 'false'}
              >
                <option value="">Select category</option>
                {['PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL', 'EXTERIOR', 'INTERIOR', 'PEST_CONTROL', 'OTHER'].map(cat => (
                  <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Optional)
            </label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} aria-label="Upload images" />
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop the images here' : 'Drag & drop images here, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Max 5 images, 5MB each</p>
            </div>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {uploadedImages.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative">
                    <img
                      src={getImagePreviewUrl(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseForm}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceRequest;
