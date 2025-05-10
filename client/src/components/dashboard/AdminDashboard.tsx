import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import LiveVoterFeed from '@/components/common/LiveVoterFeed';
import ElectionResults from '@/components/common/ElectionResults';
import { useElection } from '@/context/ElectionContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import {
  Calendar,
  Users,
  User,
  BarChart,
  Plus,
  Edit,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Election } from '@/types';

const AdminDashboard: React.FC = () => {
  const { elections, activeElections, isLoading, getElectionResults } = useElection();
  const [, navigate] = useLocation();
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [currentElection, setCurrentElection] = useState<string | null>(null);

  useEffect(() => {
    if (activeElections.length > 0) {
      setCurrentElection(activeElections[0].id);
    }
  }, [activeElections]);

  useEffect(() => {
    // Mock data just for ui display since we're not directly fetching these counts from the database
    setTotalCandidates(24);
    setTotalVotes(783);
    setTotalStudents(1254);
  }, []);

  const getStatusBadge = (election: Election) => {
    const now = new Date();
    
    if (now < election.startDate) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Scheduled
        </Badge>
      );
    } else if (now >= election.startDate && now <= election.endDate) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Active
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Completed
        </Badge>
      );
    }
  };

  const handleCreateElection = () => {
    navigate('/admin/elections/new');
  };

  const handleEditElection = (id: string) => {
    navigate(`/admin/elections/edit/${id}`);
  };

  const handleViewResults = (id: string) => {
    navigate(`/admin/elections/results/${id}`);
  };

  return (
    <div className="py-4 space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-500 truncate">Active Elections</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {isLoading ? (
                      <Skeleton className="h-6 w-8" />
                    ) : (
                      activeElections.length
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-primary-600 hover:text-primary-500"
                  onClick={() => navigate('/admin/elections')}
                >
                  View all
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-500 truncate">Total Candidates</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {isLoading ? <Skeleton className="h-6 w-8" /> : totalCandidates}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-success-600 hover:text-success-500"
                  onClick={() => navigate('/admin/candidates')}
                >
                  View all
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-secondary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-500 truncate">Registered Students</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {isLoading ? <Skeleton className="h-6 w-12" /> : totalStudents}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-secondary-600 hover:text-secondary-500"
                  onClick={() => navigate('/admin/students')}
                >
                  View all
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-500 truncate">Total Votes Cast</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {isLoading ? <Skeleton className="h-6 w-10" /> : totalVotes}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-warning-600 hover:text-warning-500"
                  onClick={() => navigate('/admin/reports')}
                >
                  View details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Elections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-neutral-900 font-heading">Active Elections</h2>
          <Button 
            onClick={handleCreateElection}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create Election
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-0">
              <Skeleton className="h-60 w-full" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Election</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Candidates</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                        No elections found. Create your first election to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    elections.slice(0, 5).map((election) => (
                      <TableRow key={election.id}>
                        <TableCell>
                          <div className="font-medium text-neutral-900">{election.title}</div>
                          <div className="text-sm text-neutral-500">{election.type}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(election)}</TableCell>
                        <TableCell className="text-neutral-500">8</TableCell>
                        <TableCell className="text-neutral-500">
                          {format(election.startDate, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-neutral-500">
                          {format(election.endDate, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-neutral-500">432</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="link"
                            className="mr-2 text-primary-600 hover:text-primary-900"
                            onClick={() => handleEditElection(election.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="link"
                            className="text-primary-600 hover:text-primary-900"
                            onClick={() => handleViewResults(election.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      {/* Live Voter Feed */}
      <LiveVoterFeed isAdmin={true} />

      {/* Results Chart */}
      {currentElection && (
        <div className="mt-6">
          <h2 className="text-xl font-medium text-neutral-900 font-heading mb-4">
            Current Results: {activeElections.length > 0 ? activeElections[0].title : 'No Active Elections'}
          </h2>
          {activeElections.length > 0 ? (
            <ElectionResults electionId={currentElection} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-neutral-600">No active election to display results for.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
