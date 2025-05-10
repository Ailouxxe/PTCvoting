import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import { useAuth } from '@/context/AuthContext';

const StudentDashboardPage: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or is admin
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    } else if (currentUser?.role === 'admin') {
      navigate('/admin');
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <MainLayout title="Dashboard" subtitle="View and participate in active elections">
      <StudentDashboard />
    </MainLayout>
  );
};

export default StudentDashboardPage;
