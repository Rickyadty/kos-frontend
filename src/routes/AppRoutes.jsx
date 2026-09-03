import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth
import Login from '../pages/auth/Login';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Rooms
import Rooms from '../pages/rooms/Rooms';

// Tenants
import Tenants from '../pages/tenants/Tenants';
import TenantCreate from '../pages/tenants/TenantCreate';
import TenantDetail from '../pages/tenants/TenantDetail';
import TenantEdit from '../pages/tenants/TenantEdit';

// Rentals
import Rentals from '../pages/rentals/Rentals';
import RentalCreate from '../pages/rentals/RentalCreate';
import RentalDetail from '../pages/rentals/RentalDetail';

// Bills
import Bills from '../pages/bills/Bills';
import BillDetail from '../pages/bills/BillDetail';

// Payments
import Payments from '../pages/payments/Payments';
import PaymentCreate from '../pages/payments/PaymentCreate';
import PaymentDetail from '../pages/payments/PaymentDetail';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/rooms" element={<Rooms />} />
          <Route path="/tenants" element={<Tenants />} />
          <Route path="/tenants/create" element={<TenantCreate />} />
          <Route path="/tenants/:id" element={<TenantDetail />} />
          <Route path="/tenants/:id/edit" element={<TenantEdit />} />

          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/create" element={<RentalCreate />} />
          <Route path="/rentals/:id" element={<RentalDetail />} />

          <Route path="/bills" element={<Bills />} />
          <Route path="/bills/:id" element={<BillDetail />} />

          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/create" element={<PaymentCreate />} />
          <Route path="/payments/:id" element={<PaymentDetail />} />
        </Route>
      </Route>

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
