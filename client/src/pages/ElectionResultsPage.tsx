import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import ElectionResults from '@/components/common/ElectionResults';
import { useAuth } from '@/context/AuthContext';
import { useElection } from '@/context/ElectionContext';
import { Election } from '@/types';

interface ElectionResultsPageProps {
  params: {
    id: string;
  };
}

const ElectionResultsPage: React.FC<ElectionResultsPageProps> = ({ params }) => {
  const { id } = params;
  const { currentUser, isLoading, isAdmin } = useAuth();
  const { getElectionById } = useElection();
  const [, navigate] = useLocation();
  const [election, setElection] = useState<Election | null>(null);
  const [isLoadingElection, setIsLoadingElection] = useState(true);

  // Redirect if not authenticated 
  // (admin check is done later to show proper error message)
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);

  // Fetch election data
  useEffect(() => {
    const fetchElection = async () => {
      setIsLoadingElection(true);
      try {
        const electionData = await getElectionById(id);
        setElection(electionData);
      } catch (error) {
        console.error('Error fetching election:', error);
      } finally {
        setIsLoadingElection(false);
      }
    };

    if (currentUser) {
      fetchElection();
    }
  }, [id, currentUser, getElectionById]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Access Denied</h2>
            <p className="mb-4">You don't have permission to view election results.</p>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="text-white p-0" 
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoadingElection ? (
            <>
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-80 w-full" />
            </>
          ) : !election ? (
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-bold mb-4">Election Not Found</h2>
                <p className="mb-4">The election you are looking for does not exist or has been removed.</p>
                <Button onClick={() => navigate('/admin')}>Return to Dashboard</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-6">{election.title} - Results</h1>
              <ElectionResults electionId={id} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ElectionResultsPage;
