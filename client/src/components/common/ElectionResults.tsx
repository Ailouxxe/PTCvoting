import React, { useState, useEffect } from 'react';
import { BarChart } from '@/components/ui/chart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useElection } from '@/context/ElectionContext';
import { Candidate } from '@/types';

interface ElectionResultsProps {
  electionId: string;
}

const ElectionResults: React.FC<ElectionResultsProps> = ({ electionId }) => {
  const { getElectionResults } = useElection();
  const [results, setResults] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const candidatesWithVotes = await getElectionResults(electionId);
        setResults(candidatesWithVotes);
        setTotalVotes(candidatesWithVotes.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0));
      } catch (error) {
        console.error('Error fetching election results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [electionId, getElectionResults]);

  // Prepare data for the chart
  const chartData = results.map(candidate => ({
    name: candidate.name,
    value: candidate.voteCount || 0,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-neutral-600">No results available for this election.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-80">
          <BarChart 
            data={chartData} 
            height={300}
            colors={["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--warning-500))", "hsl(var(--success-500))"]}
          />
          <div className="w-full border-t border-neutral-200 pt-4 mt-auto">
            <div className="text-center text-sm text-neutral-500">Total votes: {totalVotes}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElectionResults;
