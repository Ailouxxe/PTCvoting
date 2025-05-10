import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Candidate } from '@/types';

interface CandidateCardProps {
  candidate: Candidate;
  onVote: () => void;
  disabled?: boolean;
  showVoteCount?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  onVote, 
  disabled = false,
  showVoteCount = false
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="overflow-hidden shadow divide-y divide-neutral-200">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex flex-col items-center">
          {candidate.photoURL ? (
            <div className="w-full h-48 mb-4 overflow-hidden rounded-md">
              <img 
                src={candidate.photoURL} 
                alt={candidate.name}
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <Avatar className="w-24 h-24 mb-4">
              <AvatarFallback className="text-lg bg-primary-100 text-primary-800">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="text-center">
            <h3 className="text-lg leading-6 font-medium text-neutral-900">{candidate.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">{candidate.department}</p>
            {showVoteCount && candidate.voteCount !== undefined && (
              <p className="mt-2 text-sm font-medium text-primary-600">
                {candidate.voteCount} {candidate.voteCount === 1 ? 'vote' : 'votes'}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="text-sm text-neutral-700">
          <h4 className="font-medium mb-2">Manifesto:</h4>
          <p className="line-clamp-4">{candidate.manifesto}</p>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <Button
          className="w-full"
          onClick={onVote}
          disabled={disabled}
        >
          {disabled ? 'Vote Recorded' : `Vote for ${candidate.name}`}
        </Button>
      </div>
    </Card>
  );
};

export default CandidateCard;
