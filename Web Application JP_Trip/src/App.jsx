import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import Contace from './pages/Contace';
import AdminDashboard from './pages/AdminDashboard';
import AdminPlaces from './pages/AdminPlaces';
import AdminCategories from './pages/AdminCategories';
import AdminUsers from './pages/AdminUsers';
import LoginPromptModal from './components/LoginPromptModal';
import { getUser } from './utils/auth';

// 🔒 ต้องเข้าสู่ระบบ (สำหรับสมาชิก)
const MemberRoute = ({ children }) => {
  const location = useLocation();
  if (!getUser() || !sessionStorage.getItem('token')) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
};

// 🔒 เฉพาะ Admin (ฝั่ง server ตรวจสิทธิ์ด้วย token อีกชั้น)
const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!user || user.role !== 'admin' || !sessionStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/searchpage" element={<Navigate to="/search" replace />} />
        <Route path="/place/:category/:id" element={<PlaceDetailPage />} />
        <Route path="/contact" element={<Contace />} />
        <Route path="/contace" element={<Contace />} />

        <Route path="/favorites" element={<MemberRoute><FavoritesPage /></MemberRoute>} />
        <Route path="/plan" element={<MemberRoute><PlanPage /></MemberRoute>} />
        <Route path="/profile" element={<MemberRoute><ProfilePage /></MemberRoute>} />

        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/manage-places" element={<AdminRoute><AdminPlaces /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <LoginPromptModal />
    </BrowserRouter>
  );
}

export default App;
