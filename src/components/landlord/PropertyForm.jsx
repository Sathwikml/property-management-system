import { useForm } from 'react-hook-form';
import { propertyApi } from '../../api/propertyApi';
import { PROPERTY_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

const PropertyForm = ({ property, onClose }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: property || {
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      type: '',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: '',
      rentAmount: '',
      securityDeposit: '',
      description: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      if (property?.id) {
        await propertyApi.updateProperty(property.id, data);
        toast.success('Property updated successfully');
      } else {
        await propertyApi.createProperty(data);
        toast.success('Property created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save property');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Name *</label>
          <input
            type="text"
            {...register('name', { required: 'Property name is required' })}
            className="input-field"
            placeholder="e.g., Sunset Apartments Unit 101"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            {...register('address', { required: 'Address is required' })}
            className="input-field"
            placeholder="123 Main Street"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            {...register('city', { required: 'City is required' })}
            className="input-field"
            placeholder="San Francisco"
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
          <input
            type="text"
            {...register('state', { required: 'State is required' })}
            className="input-field"
            placeholder="CA"
          />
          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
          <input
            type="text"
            {...register('zipCode', { required: 'Zip code is required' })}
            className="input-field"
            placeholder="94102"
          />
          {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
          <select
            {...register('type', { required: 'Property type is required' })}
            className="input-field"
          >
            <option value="">Select type</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
          <input
            type="number"
            {...register('bedrooms', { min: 0 })}
            className="input-field"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
          <input
            type="number"
            step="0.5"
            {...register('bathrooms', { min: 0 })}
            className="input-field"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
          <input
            type="number"
            {...register('squareFeet')}
            className="input-field"
            placeholder="1200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent ($) *</label>
          <input
            type="number"
            step="0.01"
            {...register('rentAmount', { 
              required: 'Rent amount is required',
              min: { value: 0, message: 'Rent must be positive' }
            })}
            className="input-field"
            placeholder="2500.00"
          />
          {errors.rentAmount && <p className="mt-1 text-sm text-red-600">{errors.rentAmount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit ($)</label>
          <input
            type="number"
            step="0.01"
            {...register('securityDeposit')}
            className="input-field"
            placeholder="2500.00"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register('description')}
            className="input-field"
            rows="4"
            placeholder="Describe the property, amenities, neighborhood, etc."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Saving...' : property?.id ? 'Update Property' : 'Create Property'}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;