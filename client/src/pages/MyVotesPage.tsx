import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import VotingHistory from '@/components/common/VotingHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Vote } from 'lucide-react';

const MyVotesPage: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    } else {
      // Simulate data loading
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 500);
      return () => clearTimeout(timer);
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
    <MainLayout title="My Votes" subtitle="View your voting history and past elections">
      <div className="py-4 space-y-6">
        {isPageLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-48 mb-4" />
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-xl font-medium text-neutral-900 font-heading">Your Voting History</h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Track all elections you've participated in
                </p>
              </div>
              <Button
                className="mt-3 md:mt-0"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <VotingHistory />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default MyVotesPage;
