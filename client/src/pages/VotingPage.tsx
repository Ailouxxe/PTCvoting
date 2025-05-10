import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import VotingPageComponent from '@/components/elections/VotingPage';
import { useAuth } from '@/context/AuthContext';

interface VotingPageProps {
  params: {
    id: string;
  };
}

const VotingPage: React.FC<VotingPageProps> = ({ params }) => {
  const { id } = params;
  const { currentUser, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <VotingPageComponent electionId={id} />;
};

export default VotingPage;
