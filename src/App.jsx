import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';
import PaymentHistoryWithPayments from './pages/PaymentHistory';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={user?.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/dashboard'} /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to={user?.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/dashboard'} /> : <Register />} 
        />

        {/* Landlord Routes */}
        <Route
          path="/landlord/dashboard"
          element={
            <ProtectedRoute allowedRoles={['LANDLORD']}>
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/payments"
          element={
            <ProtectedRoute allowedRoles={['LANDLORD']}>
              <PaymentHistoryWithPayments />
            </ProtectedRoute>
          }
        />

        {/* Tenant Routes */}
        <Route
          path="/tenant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['TENANT']}>
              <TenantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenant/payments"
          element={
            <ProtectedRoute allowedRoles={['TENANT']}>
              <PaymentHistoryWithPayments />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to={user?.role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/dashboard'} /> : 
              <Navigate to="/login" />
          } 
        />
        
        <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Unauthorized Access</h1></div>} />
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">404 - Page Not Found</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
