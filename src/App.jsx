import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import PageLoader from '@/components/PageLoader';

// Route-level code splitting via React.lazy()
// Each page is loaded on-demand, reducing initial bundle size
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const HierarchyPage = lazy(() => import('@/features/properties/HierarchyPage'));
const PropertyDetailPage = lazy(() => import('@/features/properties/PropertyDetailPage'));
const SubordinatesPage = lazy(() => import('@/features/subordinates/SubordinatesPage'));
const SubordinateDashboardPage = lazy(() => import('@/features/subordinates/SubordinateDashboardPage'));
const SubordinateHierarchyPage = lazy(() => import('@/features/subordinates/SubordinateHierarchyPage'));
const TenantsPage = lazy(() => import('@/features/tenants/TenantsPage'));
const SubordinateTenantsPage = lazy(() => import('@/features/tenants/SubordinateTenantsPage'));

/**
 * Root application component defining all routes.
 * Uses layout routes for shared DashboardLayout and
 * ProtectedRoute for auth + RBAC enforcement.
 */
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Head Office routes (headoffice + admin roles) */}
        <Route element={<ProtectedRoute allowedRoles={['headoffice', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subordinates" element={<SubordinatesPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/hierarchy" element={<HierarchyPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
          </Route>
        </Route>

        {/* Subordinate Manager routes */}
        <Route element={<ProtectedRoute allowedRoles={['subordinate']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/subordinate-dashboard" element={<SubordinateDashboardPage />} />
            <Route path="/subordinate-hierarchy" element={<SubordinateHierarchyPage />} />
            <Route path="/subordinate-tenants" element={<SubordinateTenantsPage />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
