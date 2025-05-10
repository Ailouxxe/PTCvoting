import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Election } from '@/types';
import { useElection } from '@/context/ElectionContext';

interface ElectionCardProps {
  election: Election;
  onAction: () => void;
  actionText: string;
  icon: React.ReactNode;
  status: string;
  statusColor: string;
  actionButtonVariant?: 'default' | 'outline';
}

const ElectionCard: React.FC<ElectionCardProps> = ({
  election,
  onAction,
  actionText,
  icon,
  status,
  statusColor,
  actionButtonVariant = 'default',
}) => {
  const { hasVoted } = useElection();
  const hasUserVoted = hasVoted(election.id);
  
  const getTimeRemaining = () => {
    const now = new Date();
    if (now < election.startDate) {
      return `Starts in: ${formatDistanceToNow(election.startDate)}`;
    } else if (now <= election.endDate) {
      return `Ends in: ${formatDistanceToNow(election.endDate)}`;
    } else {
      return 'Election has ended';
    }
  };

  const getCardColorClass = () => {
    if (hasUserVoted) {
      return 'border-green-200 bg-green-50';
    }
    return '';
  };

  return (
    <Card className={cn("overflow-hidden", getCardColorClass())}>
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-center">
            <div className={cn("flex-shrink-0 rounded-md p-3", statusColor)}>
              {icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <p className="text-sm font-medium text-neutral-500 truncate">{election.title}</p>
              <div className="text-lg font-medium text-neutral-900">
                {hasUserVoted ? 'Vote recorded' : status}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-5 py-3">
          <div className="text-sm">
            <span className="font-medium text-neutral-500">
              {getTimeRemaining().split(':')[0]}:
            </span>{' '}
            <span className="font-medium text-primary-700">
              {getTimeRemaining().split(':')[1]}
            </span>
          </div>
          <div className="mt-2">
            {hasUserVoted ? (
              <Button
                className={actionButtonVariant === 'outline' ? 'border-neutral-300 text-neutral-700' : ''}
                variant={actionButtonVariant === 'outline' ? 'outline' : 'default'}
                onClick={onAction}
              >
                View Details
              </Button>
            ) : (
              <Button
                className={actionButtonVariant === 'outline' ? 'border-neutral-300 text-neutral-700' : ''}
                variant={actionButtonVariant === 'outline' ? 'outline' : 'default'}
                onClick={onAction}
              >
                {actionText}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElectionCard;
