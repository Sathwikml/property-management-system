import { useState, useEffect } from 'react';
import { leaseApi } from '../../api/leaseApi';
import { paymentApi } from '../../api/paymentApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';

const Dashboard = () => {
  const [lease, setLease] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [leaseData, paymentsData, maintenanceData] = await Promise.all([
        leaseApi.getTenantLease().catch(() => null),
        paymentApi.getTenantPayments().catch(() => []),
        maintenanceApi.getTenantRequests().catch(() => [])
      ]);

      setLease(leaseData || null);
      setRecentPayments(Array.isArray(paymentsData) ? paymentsData.slice(0, 5) : []);
      setMaintenanceRequests(Array.isArray(maintenanceData) ? maintenanceData.slice(0, 5) : []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lease Info Card */}
      {lease ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Lease</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Property</p>
              <p className="text-lg font-semibold text-gray-900">
                {lease.property?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Monthly Rent</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(lease.rentAmount || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Lease Period</p>
              <p className="text-lg font-semibold text-gray-900">
                {lease.startDate && lease.endDate
                  ? `${formatDate(lease.startDate)} to ${formatDate(lease.endDate)}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-center">No active lease found</p>
        </div>
      )}

      {/* Recent Payments Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
        {recentPayments && recentPayments.length > 0 ? (
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {formatDate(payment.paymentDate)}
                  </p>
                  <p className="text-sm text-gray-600">{payment.description || 'Payment'}</p>
                </div>
                <p className="font-semibold text-gray-900 ml-4">
                  {formatCurrency(payment.amount || 0)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No payments recorded yet</p>
        )}
      </div>

      {/* Maintenance Requests Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Requests</h3>
        {maintenanceRequests && maintenanceRequests.length > 0 ? (
          <div className="space-y-3">
            {maintenanceRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{request.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {request.createdDate && formatDate(request.createdDate)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No maintenance requests</p>
        )}
      </div>
    </div>
  );
};

// Helper function for status color
const getStatusColor = (status) => {
  const statusMap = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'IN_PROGRESS': 'bg-blue-100 text-blue-800',
    'COMPLETED': 'bg-green-100 text-green-800',
    'REJECTED': 'bg-red-100 text-red-800',
  };
  return statusMap[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
};

export default Dashboard;
