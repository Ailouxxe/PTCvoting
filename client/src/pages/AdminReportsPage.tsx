import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useElection } from '@/context/ElectionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart } from '@/components/ui/chart';
import ElectionResults from '@/components/common/ElectionResults';
import { Skeleton } from '@/components/ui/skeleton';
import { Election } from '@/types';

const AdminReportsPage: React.FC = () => {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const { elections, getElectionResults } = useElection();
  const [, navigate] = useLocation();
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    } else if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoading, isAdmin, navigate]);

  // Set initial selected election when elections are loaded
  useEffect(() => {
    if (elections.length > 0 && !selectedElectionId) {
      setSelectedElectionId(elections[0].id);
    }
  }, [elections, selectedElectionId]);

  // Load election data when selectedElectionId changes
  useEffect(() => {
    if (!selectedElectionId) return;

    const loadElectionData = async () => {
      setIsChartLoading(true);
      try {
        const results = await getElectionResults(selectedElectionId);
        const formattedData = results.map(candidate => ({
          name: candidate.name,
          value: candidate.voteCount || 0,
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error('Error loading election data:', error);
      } finally {
        setIsChartLoading(false);
      }
    };

    loadElectionData();
  }, [selectedElectionId, getElectionResults]);

  if (isLoading || !currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <MainLayout title="Election Reports" subtitle="View detailed voting statistics and results">
      <div className="py-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Election Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select
                value={selectedElectionId}
                onValueChange={setSelectedElectionId}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select an election" />
                </SelectTrigger>
                <SelectContent>
                  {elections.map((election: Election) => (
                    <SelectItem key={election.id} value={election.id}>
                      {election.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedElectionId && (
              <Tabs defaultValue="bar" className="mt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                  <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                  <TabsTrigger value="results">Detailed Results</TabsTrigger>
                </TabsList>
                <TabsContent value="bar">
                  {isChartLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <BarChart data={chartData} height={300} />
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="pie">
                  {isChartLoading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <div className="h-80">
                      <PieChart data={chartData} height={300} />
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="results">
                  {selectedElectionId && <ElectionResults electionId={selectedElectionId} />}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voter Participation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Registered Students</p>
                    <p className="text-3xl font-bold">1,254</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Votes Cast</p>
                    <p className="text-3xl font-bold">783</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Participation Rate</p>
                    <p className="text-3xl font-bold">62.4%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminReportsPage;
