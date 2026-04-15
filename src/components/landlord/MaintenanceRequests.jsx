import { useState, useEffect } from 'react';
import { maintenanceApi } from '../../api/maintenanceApi';
import { getStatusColor, getPriorityColor, getRelativeTime } from '../../utils/helpers';
import { MAINTENANCE_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await maintenanceApi.getRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await maintenanceApi.updateStatus(requestId, newStatus);
      toast.success('Status updated successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      await maintenanceApi.deleteRequest(requestId);
      toast.success('Request deleted successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  if (loading) return <Loading />;

  const filteredRequests = filterStatus === 'ALL' 
    ? requests 
    : requests.filter(req => req.status === filterStatus);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Maintenance Requests</h2>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
          >
            <option value="ALL">All Status</option>
            {Object.values(MAINTENANCE_STATUS).map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 py-2">
            {filteredRequests.length} requests
          </span>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">
            {filterStatus === 'ALL' 
              ? 'No maintenance requests found' 
              : `No ${filterStatus.replace(/_/g, ' ').toLowerCase()} requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.title || 'Maintenance Request'}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority || 'NORMAL'}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status || 'PENDING'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {request.description || 'No description provided'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <span>🏢 Property: {request.property?.name || 'N/A'}</span>
                    <span>👤 Tenant: {request.tenant?.firstName || ''} {request.tenant?.lastName || 'N/A'}</span>
                    <span>📅 Reported: {getRelativeTime(request.createdAt)}</span>
                    {request.assignedTo && (
                      <span>🔧 Assigned: {request.assignedTo.firstName} {request.assignedTo.lastName}</span>
                    )}
                  </div>
                </div>
              </div>

              {request.imageUrls && request.imageUrls.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {request.imageUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={url}
                        alt={`Issue ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                    </a>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t flex-wrap">
                <select
                  value={request.status || 'PENDING'}
                  onChange={(e) => handleStatusChange(request.id, e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(MAINTENANCE_STATUS).map(status => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>

                <button className="btn-secondary text-sm">
                  View Details
                </button>

                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaintenanceRequests;
