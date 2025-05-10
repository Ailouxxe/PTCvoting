import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ElectionCard from '@/components/elections/ElectionCard';
import VotingHistory from '@/components/common/VotingHistory';
import LiveVoterFeed from '@/components/common/LiveVoterFeed';
import { useElection } from '@/context/ElectionContext';
import { Check, Clock } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { activeElections, upcomingElections, isLoading } = useElection();
  const [, navigate] = useLocation();

  const handleViewVote = (electionId: string) => {
    navigate(`/vote/${electionId}`);
  };

  return (
    <div className="py-4 space-y-6">
      {/* Active Elections */}
      <div>
        <h2 className="text-xl font-medium text-neutral-900 font-heading mb-4">Active Elections</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Skeleton className="h-12 w-12 rounded-md" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-neutral-50 px-5 py-3">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeElections.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeElections.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onAction={() => handleViewVote(election.id)}
                actionText="View & Vote"
                icon={<Check className="h-6 w-6 text-white" />}
                status="Voting in progress"
                statusColor="bg-primary-500"
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-neutral-600">No active elections at this time.</p>
              <p className="text-sm text-neutral-400 mt-1">Check back later or view upcoming elections below.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Elections */}
      {!isLoading && upcomingElections.length > 0 && (
        <div>
          <h2 className="text-xl font-medium text-neutral-900 font-heading mb-4">Upcoming Elections</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingElections.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onAction={() => navigate(`/election/${election.id}`)}
                actionText="View details"
                icon={<Clock className="h-6 w-6 text-white" />}
                status="Starting soon"
                statusColor="bg-neutral-400"
                actionButtonVariant="outline"
              />
            ))}
          </div>
        </div>
      )}

      {/* Voting History */}
      <VotingHistory />

      {/* Live Voter Feed */}
      <LiveVoterFeed />
    </div>
  );
};

export default StudentDashboard;
