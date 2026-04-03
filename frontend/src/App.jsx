import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Records from './pages/Records';
import Analytics from './pages/Analytics';
import Users from './pages/Users';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="h-screen w-screen flex flex-col items-center justify-center bg-[#080c14] gap-4"
      >
        <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing Fin Book...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Main Dashboard Layout Group */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* System Hub Routes */}
            <Route index element={<Dashboard />} />
            <Route path="records" element={
              <ProtectedRoute roles={['admin', 'analyst', 'viewer']}><Records /></ProtectedRoute>
            } />
            <Route path="analytics" element={
              <ProtectedRoute roles={['admin', 'analyst']}><Analytics /></ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute roles={['admin', 'analyst', 'viewer']}><Settings /></ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
