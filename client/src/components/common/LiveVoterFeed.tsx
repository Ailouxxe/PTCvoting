import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useElection } from '@/context/ElectionContext';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface LiveVoterFeedProps {
  isAdmin?: boolean;
}

const LiveVoterFeed: React.FC<LiveVoterFeedProps> = ({ isAdmin = false }) => {
  const { voterActivity, isLoading } = useElection();

  return (
    <div className="mt-6">
      <h2 className="text-xl font-medium text-neutral-900 font-heading mb-4">Live Voter Feed</h2>
      <Card className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <CardContent className="p-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="px-4 py-3 flex items-center border-b border-neutral-200 last:border-b-0">
                <div className="min-w-0 flex-1 flex items-center">
                  <div className="flex-shrink-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1 px-4">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {voterActivity.length === 0 ? (
              <li className="p-4 text-center text-neutral-500">
                No voting activity yet. Be the first to cast a vote!
              </li>
            ) : (
              voterActivity.map((activity) => (
                <li key={activity.id} className="px-4 py-3 flex items-center">
                  <div className="min-w-0 flex-1 flex items-center">
                    <div className="flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary-100 text-primary-800 font-bold">
                          {activity.userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {activity.userName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          Voted in <span className="font-medium">{activity.electionTitle}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm whitespace-nowrap text-neutral-500">
                      <time>{formatDistanceToNow(activity.timestamp)} ago</time>
                    </div>
                    {isAdmin && (
                      <div className="text-sm text-neutral-500">ID: {activity.userId.substring(0, 8)}</div>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default LiveVoterFeed;
