import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Counsellor from './pages/Counsellor';
import Universities from './pages/Universities';
import Shortlisted from './pages/Shortlisted';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.onboardingCompleted) return <Navigate to="/onboarding" />;
  
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/onboarding" element={user && !user.onboardingCompleted ? <Onboarding /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/counsellor" element={<ProtectedRoute><Counsellor /></ProtectedRoute>} />
      <Route path="/universities" element={<ProtectedRoute><Universities /></ProtectedRoute>} />
      <Route path="/shortlisted" element={<ProtectedRoute><Shortlisted /></ProtectedRoute>} />
      <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
};

function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;