import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import CreateProgram from './pages/CreateProgram';
import SubmitReport from './pages/SubmitReport';
import ReportDetail from './pages/ReportDetail';
import ResearcherDashboard from './pages/ResearcherDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminPanel from './pages/AdminPanel';
import PaymentVerify from './pages/PaymentVerify';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Any logged in user */}
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="/reports/:id" element={
            <ProtectedRoute><ReportDetail /></ProtectedRoute>
          } />

          {/* Researcher only */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['researcher']}>
              <ResearcherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/reports/submit" element={
            <ProtectedRoute roles={['researcher']}>
              <SubmitReport />
            </ProtectedRoute>
          } />

          {/* Company only */}
          <Route path="/dashboard/company" element={
            <ProtectedRoute roles={['company']}>
              <CompanyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/programs/create" element={
            <ProtectedRoute roles={['company']}>
              <CreateProgram />
            </ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/payments/verify" element={
            <ProtectedRoute>
              <PaymentVerify />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;