import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Pencil, MoreHorizontal, Trash2, Eye, UserPlus } from 'lucide-react';
import { useElection } from '@/context/ElectionContext';
import { useToast } from '@/hooks/use-toast';
import { Election } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const ElectionsTable: React.FC = () => {
  const { elections, isLoading, deleteElection } = useElection();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [electionToDelete, setElectionToDelete] = useState<Election | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditElection = (id: string) => {
    navigate(`/admin/elections/edit/${id}`);
  };

  const handleViewResults = (id: string) => {
    navigate(`/admin/elections/results/${id}`);
  };

  const handleAddCandidate = (id: string) => {
    navigate(`/admin/candidates/new?electionId=${id}`);
  };

  const confirmDeleteElection = (election: Election) => {
    setElectionToDelete(election);
  };

  const handleDeleteConfirmed = async () => {
    if (!electionToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteElection(electionToDelete.id);
      toast({
        title: 'Election deleted',
        description: `${electionToDelete.title} has been deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setElectionToDelete(null);
    }
  };

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

  const columns: ColumnDef<Election>[] = [
    {
      accessorKey: 'title',
      header: 'Election',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-sm text-muted-foreground">{row.original.type}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => row.original.department || 'Campus-wide',
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => format(row.original.startDate, 'MMM d, yyyy'),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => format(row.original.endDate, 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const election = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditElection(election.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewResults(election.id)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Results</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddCandidate(election.id)}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Add Candidate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => confirmDeleteElection(election)} 
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <DataTable 
          columns={columns} 
          data={elections} 
          searchKey="title"
          searchPlaceholder="Search elections..."
        />
        
        <AlertDialog open={!!electionToDelete} onOpenChange={() => !isDeleting && setElectionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the "{electionToDelete?.title}" election, all its candidates, and all votes associated with it. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirmed} 
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ElectionsTable;
