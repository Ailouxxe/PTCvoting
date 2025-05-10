import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check } from 'lucide-react';
import { useElection } from '@/context/ElectionContext';
import { format } from 'date-fns';

const VotingHistory: React.FC = () => {
  const { getUserVotingHistory } = useElection();
  const [votingHistory, setVotingHistory] = useState<Array<{
    vote: any;
    election: any;
    candidate: any;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVotingHistory = async () => {
      setIsLoading(true);
      try {
        const history = await getUserVotingHistory();
        setVotingHistory(history);
      } catch (error) {
        console.error('Error fetching voting history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotingHistory();
  }, [getUserVotingHistory]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-medium text-neutral-900 font-heading mb-4">Your Voting History</h2>
      
      {isLoading ? (
        <Card>
          <ul className="divide-y divide-neutral-200">
            {[1, 2].map((i) => (
              <li key={i} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <div className="ml-4">
                      <Skeleton className="h-5 w-48 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-4 w-60" />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : votingHistory.length === 0 ? (
        <Card>
          <div className="px-4 py-5 sm:p-6 text-center">
            <h3 className="text-lg leading-6 font-medium text-neutral-900">No voting history</h3>
            <div className="mt-2 max-w-xl text-sm text-neutral-500 mx-auto">
              <p>You haven't voted in any elections yet. Active elections will appear on your dashboard.</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-neutral-200">
            {votingHistory.map((item) => (
              <li key={item.vote.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-success-500 flex items-center justify-center">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-900">{item.election.title}</h3>
                      <p className="text-sm text-neutral-500">
                        You voted on {format(item.vote.timestamp, 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Completed
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-neutral-500">
                      <span>You voted for: </span>
                      <span className="ml-1 font-medium text-neutral-900">{item.candidate.name}</span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default VotingHistory;
