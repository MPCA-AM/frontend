import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import MapPage from '@/pages/MapPage';
import AdminPage from '@/pages/AdminPage';
import EditeurPage from '@/pages/EditeurPage';
import ProfilPage from '@/pages/ProfilPage';
import ProtectedRoute from '@/pages/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MapPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/map" element={<Navigate to="/" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profil" element={<ProfilPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['editeur', 'admin']} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/editeur" element={<EditeurPage />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
