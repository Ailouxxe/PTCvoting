import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, ArrowLeft, Check } from 'lucide-react';
import { useElection } from '@/context/ElectionContext';
import { Election, Candidate } from '@/types';
import CandidateCard from './CandidateCard';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface VotingPageProps {
  electionId: string;
}

const VotingPage: React.FC<VotingPageProps> = ({ electionId }) => {
  const [, navigate] = useLocation();
  const { getElectionById, getCandidatesByElection, castVote, hasVoted } = useElection();
  const { toast } = useToast();
  
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const electionData = await getElectionById(electionId);
        if (!electionData) {
          setErrorMessage('Election not found or has been removed.');
          return;
        }
        
        setElection(electionData);
        
        // Check if voting period is valid
        const now = new Date();
        if (now < electionData.startDate) {
          setErrorMessage('This election has not started yet.');
          return;
        }
        
        if (now > electionData.endDate) {
          setErrorMessage('This election has already ended.');
          return;
        }
        
        // Check if user has already voted
        const userHasVoted = hasVoted(electionId);
        setAlreadyVoted(userHasVoted);
        
        // Get candidates
        const candidatesData = await getCandidatesByElection(electionId);
        setCandidates(candidatesData);
      } catch (error) {
        console.error('Error fetching election data:', error);
        setErrorMessage('Failed to load election data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [electionId, getElectionById, getCandidatesByElection, hasVoted]);

  const handleVote = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowConfirmDialog(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    
    setIsSubmitting(true);
    try {
      await castVote(electionId, selectedCandidate.id);
      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      setAlreadyVoted(true);
    } catch (error: any) {
      setShowConfirmDialog(false);
      toast({
        title: 'Error casting vote',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" className="text-white p-0" onClick={handleReturnToDashboard}>
                  <ArrowLeft className="h-6 w-6 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-5 w-36" />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-10 w-72 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-32 mb-1" />
                      <Skeleton className="h-4 w-48 mb-4" />
                      <Skeleton className="h-24 w-full mb-4" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="bg-primary-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <Button variant="ghost" className="text-white p-0" onClick={handleReturnToDashboard}>
                <ArrowLeft className="h-6 w-6 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-md w-full px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={handleReturnToDashboard}>Return to Dashboard</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const timeRemaining = election ? formatDistanceToNow(election.endDate) : '';

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" className="text-white p-0" onClick={handleReturnToDashboard}>
                <ArrowLeft className="h-6 w-6 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-xl font-bold text-white">{election?.title}</h1>
            <div className="text-sm text-primary-200">
              Voting closes in: <span className="font-medium">{timeRemaining}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate font-heading">
                Cast Your Vote
              </h2>
              <p className="mt-1 text-neutral-500">
                Please select one candidate for the position of {election?.title}.
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <span className="inline-flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  1 of 1 positions
                </span>
              </span>
            </div>
          </div>

          {alreadyVoted && (
            <Alert className="mb-6">
              <Check className="h-4 w-4" />
              <AlertTitle>Already Voted</AlertTitle>
              <AlertDescription>
                You have already cast your vote in this election. You can only vote once per election.
              </AlertDescription>
            </Alert>
          )}

          {candidates.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium">No candidates found</h3>
                <p className="text-neutral-500 mt-1">
                  There are no candidates available for this election.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onVote={() => handleVote(candidate)}
                  disabled={alreadyVoted}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Vote</DialogTitle>
            <DialogDescription>
              You are about to cast your vote for{' '}
              <span className="font-medium text-neutral-900">{selectedCandidate?.name}</span>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmVote} 
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Vote'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vote Submitted Successfully</DialogTitle>
            <DialogDescription>
              Your vote has been recorded securely. Thank you for participating in the {election?.title}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleReturnToDashboard}
              className="bg-success-600 hover:bg-success-700"
            >
              Return to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VotingPage;
