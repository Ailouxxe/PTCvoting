import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { useAuth } from '@/context/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    } else if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoading, isAdmin, navigate]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect to student dashboard
  }

  return (
    <MainLayout title="Admin Dashboard" subtitle="Manage elections, candidates, and view results">
      <AdminDashboard />
    </MainLayout>
  );
};

export default AdminDashboardPage;
