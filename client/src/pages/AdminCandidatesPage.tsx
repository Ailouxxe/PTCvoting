import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import CandidatesTable from '@/components/admin/CandidatesTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const AdminCandidatesPage: React.FC = () => {
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
    <MainLayout title="Candidates Management" subtitle="Add, edit, and manage election candidates">
      <div className="py-4">
        <div className="flex justify-end mb-6">
          <Button onClick={() => navigate('/admin/candidates/new')} className="bg-primary-600 hover:bg-primary-700">
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Candidate
          </Button>
        </div>
        <CandidatesTable />
      </div>
    </MainLayout>
  );
};

export default AdminCandidatesPage;
