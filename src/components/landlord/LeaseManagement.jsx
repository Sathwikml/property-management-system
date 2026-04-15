import { useState, useEffect } from 'react';
import { leaseApi } from '../../api/leaseApi';
import { formatDate, formatCurrency, getStatusColor, daysUntil } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Loading from '../common/Loading';

const LeaseManagement = () => {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const data = await leaseApi.getLeases();
      setLeases(data);
    } catch (error) {
      console.error('Error fetching leases:', error);
      toast.error('Failed to load leases');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (leaseId) => {
    if (!window.confirm('Are you sure you want to terminate this lease?')) return;
    
    const reason = window.prompt('Termination reason:');
    if (!reason) return;

    try {
      await leaseApi.terminateLease(leaseId, { reason });
      toast.success('Lease terminated successfully');
      fetchLeases();
    } catch (error) {
      console.error('Error terminating lease:', error);
      toast.error('Failed to terminate lease');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Lease Management</h2>
        <span className="text-sm text-gray-500">{leases.length} leases</span>
      </div>

      {leases.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No leases found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leases.map((lease) => {
            const daysRemaining = daysUntil(lease.endDate);
            const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;

            return (
              <div key={lease.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {lease.property?.name || 'Property'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tenant: {lease.tenant?.firstName} {lease.tenant?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">
                      {formatCurrency(lease.rentAmount)}/month
                    </p>
                    {isExpiringSoon && (
                      <p className="text-sm text-orange-600 mt-2 font-medium">
                        ⚠️ Expiring in {daysRemaining} days
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 items-end">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(lease.status)}`}>
                      {lease.status}
                    </span>
                    {lease.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleTerminate(lease.id)}
                        className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
                      >
                        Terminate Lease
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaseManagement;
