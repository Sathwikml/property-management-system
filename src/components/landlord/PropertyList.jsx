import { useState, useEffect } from 'react';
import { propertyApi } from '../../api/propertyApi';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import PropertyForm from './PropertyForm';
import Modal from '../common/Modal';
import Loading from '../common/Loading';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyApi.getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property) => {
    setSelectedProperty(property);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertyApi.deleteProperty(id);
      toast.success('Property deleted successfully');
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedProperty(null);
    fetchProperties();
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600">Manage your rental properties</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first property</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="card hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                {property.imageUrls && property.imageUrls.length > 0 ? (
                  <img
                    src={property.imageUrls[0]}
                    alt={property.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{property.name || 'Property'}</h3>
                  <p className="text-sm text-gray-600">{property.address || 'N/A'}</p>
                  {property.city && property.state && (
                    <p className="text-sm text-gray-500">
                      {property.city}, {property.state} {property.zipCode || ''}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  property.occupied
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {property.occupied ? '✓ Occupied' : '○ Vacant'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-3 border-y border-gray-200 my-3">
                {property.bedrooms !== null && property.bedrooms !== undefined && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Bedrooms</p>
                    <p className="text-sm font-semibold">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms !== null && property.bathrooms !== undefined && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Bathrooms</p>
                    <p className="text-sm font-semibold">{property.bathrooms}</p>
                  </div>
                )}
                {property.squareFeet && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Sq Ft</p>
                    <p className="text-sm font-semibold">{property.squareFeet.toLocaleString()}</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-semibold">{property.type || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Rent</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(property.rentAmount || 0)}
                  </span>
                </div>
                {property.securityDeposit && property.securityDeposit > 0 && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Security Deposit</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(property.securityDeposit)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(property)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleFormClose}
        title={selectedProperty ? 'Edit Property' : 'Add New Property'}
        size="lg"
      >
        <PropertyForm property={selectedProperty} onClose={handleFormClose} />
      </Modal>
    </div>
  );
};

export default PropertyList;
