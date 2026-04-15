import { useState, useEffect } from 'react';
import { tenantApi } from '../../api/tenantApi';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantApi.getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotice = async (tenantId) => {
    try {
      await tenantApi.sendNotice(tenantId, {
        type: 'GENERAL',
        message: 'Important notice from property manager',
      });
      toast.success('Notice sent successfully');
    } catch (error) {
      console.error('Error sending notice:', error);
      toast.error('Failed to send notice');
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!window.confirm('Are you sure you want to delete this tenant record?')) return;

    try {
      await tenantApi.deleteTenant(tenantId);
      toast.success('Tenant deleted successfully');
      fetchTenants();
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Failed to delete tenant');
    }
  };

  if (loading) return <Loading />;

  const filteredTenants = filterStatus === 'ALL'
    ? tenants
    : tenants.filter(t => t.lease?.status === filterStatus);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-600">Manage your active and inactive tenants</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="TERMINATED">Terminated</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <span className="text-sm text-gray-600 py-2">
            {filteredTenants.length} tenants
          </span>
        </div>
      </div>

      {filteredTenants.length === 0 ? (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292m0 0H7.46m4.54 0H16.54m0 0a4 4 0 110-5.292m0 0H7.46" />
          </svg>
          <p className="text-gray-500 text-lg">
            {filterStatus === 'ALL' ? 'No tenants found' : `No ${filterStatus.toLowerCase()} tenants`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTenants.map((tenant) => (
            <div key={tenant.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tenant.firstName || ''} {tenant.lastName || 'Tenant'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    📧 {tenant.email || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    📞 {tenant.phone || 'N/A'}
                  </p>
                  {tenant.dateOfBirth && (
                    <p className="text-sm text-gray-600">
                      🎂 {formatDate(tenant.dateOfBirth)}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                  getStatusColor(tenant.lease?.status || 'PENDING')
                }`}>
                  {tenant.lease?.status || 'PENDING'}
                </span>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Property</span>
                    <span className="text-sm font-medium text-gray-900">
                      {tenant.property?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Rent</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatCurrency(tenant.lease?.rentAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lease Start</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(tenant.lease?.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lease End</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(tenant.lease?.endDate)}
                    </span>
                  </div>
                  {tenant.lease?.securityDeposit && tenant.lease.securityDeposit > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Security Deposit</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(tenant.lease.securityDeposit)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSendNotice(tenant.id)}
                  className="flex-1 min-w-[120px] bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Send Notice
                </button>
                <button
                  onClick={() => handleDeleteTenant(tenant.id)}
                  className="flex-1 min-w-[120px] bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
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

export default TenantList;
