import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useElection } from '@/context/ElectionContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ElectionForm from '@/components/elections/ElectionForm';
import { Election } from '@/types';

interface AdminElectionFormPageProps {
  params?: {
    id?: string;
  };
}

const AdminElectionFormPage: React.FC<AdminElectionFormPageProps> = ({ params }) => {
  const { id } = params || {};
  const isEditMode = !!id;
  const { currentUser, isLoading, isAdmin } = useAuth();
  const { getElectionById } = useElection();
  const [, navigate] = useLocation();
  const [election, setElection] = useState<Election | undefined>(undefined);
  const [isLoadingElection, setIsLoadingElection] = useState(isEditMode);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    } else if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoading, isAdmin, navigate]);

  // Load election data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchElection = async () => {
        setIsLoadingElection(true);
        try {
          const electionData = await getElectionById(id);
          setElection(electionData || undefined);
        } catch (error) {
          console.error('Error fetching election:', error);
        } finally {
          setIsLoadingElection(false);
        }
      };

      fetchElection();
    }
  }, [id, isEditMode, getElectionById]);

  if (isLoading || !currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSuccessfulSubmit = () => {
    navigate('/admin/elections');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="text-white p-0" 
              onClick={() => navigate('/admin/elections')}
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Back to Elections
            </Button>
            <h1 className="text-xl font-bold text-white">
              {isEditMode ? 'Edit Election' : 'Create New Election'}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isEditMode && isLoadingElection ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-24 mr-2" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <ElectionForm 
              election={election} 
              onSubmitSuccess={handleSuccessfulSubmit} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminElectionFormPage;
