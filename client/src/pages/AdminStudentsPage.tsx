import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import StudentsTable from '@/components/admin/StudentsTable';

const AdminStudentsPage: React.FC = () => {
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

  if (isLoading || !currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <MainLayout title="Students Management" subtitle="View and manage registered student accounts">
      <div className="py-4">
        <StudentsTable />
      </div>
    </MainLayout>
  );
};

export default AdminStudentsPage;
