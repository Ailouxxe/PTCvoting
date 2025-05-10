import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { useElection } from '@/context/ElectionContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CandidateForm from '@/components/elections/CandidateForm';
import { Candidate } from '@/types';

interface AdminCandidateFormPageProps {
  params?: {
    id?: string;
    electionId?: string;
  };
}

const AdminCandidateFormPage: React.FC<AdminCandidateFormPageProps> = ({ params }) => {
  const { id, electionId } = params || {};
  const isEditMode = !!id;
  
  const { currentUser, isLoading, isAdmin } = useAuth();
  const { elections, getCandidatesByElection } = useElection();
  const [, navigate] = useLocation();
  
  const [candidate, setCandidate] = useState<Candidate | undefined>(undefined);
  const [isLoadingCandidate, setIsLoadingCandidate] = useState(isEditMode);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    } else if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoading, isAdmin, navigate]);

  // Load candidate data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchCandidate = async () => {
        setIsLoadingCandidate(true);
        try {
          // Since we don't have a direct getCandidateById method,
          // we'll need to get all candidates for the election and find the one we want
          // First, we need to determine which election this candidate belongs to
          // For simplicity, we'll search through all elections
          
          for (const election of elections) {
            const candidates = await getCandidatesByElection(election.id);
            const foundCandidate = candidates.find(c => c.id === id);
            if (foundCandidate) {
              setCandidate(foundCandidate);
              break;
            }
          }
        } catch (error) {
          console.error('Error fetching candidate:', error);
        } finally {
          setIsLoadingCandidate(false);
        }
      };

      fetchCandidate();
    } else {
      setIsLoadingCandidate(false);
    }
  }, [id, isEditMode, elections, getCandidatesByElection]);

  if (isLoading || !currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSuccessfulSubmit = () => {
    // If we came from a specific election, go back to that election's details
    if (electionId) {
      navigate(`/admin/elections/edit/${electionId}`);
    } else {
      navigate('/admin/candidates');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="text-white p-0" 
              onClick={() => electionId ? navigate(`/admin/elections/edit/${electionId}`) : navigate('/admin/candidates')}
            >
              <ArrowLeft className="h-6 w-6 mr-2" />
              {electionId ? 'Back to Election' : 'Back to Candidates'}
            </Button>
            <h1 className="text-xl font-bold text-white">
              {isEditMode ? 'Edit Candidate' : 'Add New Candidate'}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-neutral-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoadingCandidate ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-4">
                  <Skeleton className="h-24 w-24 rounded-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-24 mr-2" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <CandidateForm 
              candidate={candidate}
              elections={elections}
              preSelectedElectionId={electionId}
              onSubmitSuccess={handleSuccessfulSubmit} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCandidateFormPage;
