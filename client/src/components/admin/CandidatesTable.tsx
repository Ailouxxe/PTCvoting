import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Pencil, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { useElection } from '@/context/ElectionContext';
import { useToast } from '@/hooks/use-toast';
import { Candidate, Election } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const CandidatesTable: React.FC = () => {
  const { candidates, elections, isLoading, deleteCandidate } = useElection();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [candidatesWithElectionDetails, setCandidatesWithElectionDetails] = useState<Array<Candidate & { electionTitle: string }>>([]);

  useEffect(() => {
    if (!isLoading && candidates.length > 0 && elections.length > 0) {
      // Merge candidate and election data
      const enrichedCandidates = candidates.map(candidate => {
        const election = elections.find(e => e.id === candidate.electionId);
        return {
          ...candidate,
          electionTitle: election?.title || 'Unknown Election'
        };
      });
      
      setCandidatesWithElectionDetails(enrichedCandidates);
    }
  }, [candidates, elections, isLoading]);

  const handleEditCandidate = (id: string) => {
    navigate(`/admin/candidates/edit/${id}`);
  };

  const handleViewElection = (electionId: string) => {
    navigate(`/admin/elections/edit/${electionId}`);
  };

  const confirmDeleteCandidate = (candidate: Candidate) => {
    setCandidateToDelete(candidate);
  };

  const handleDeleteConfirmed = async () => {
    if (!candidateToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteCandidate(candidateToDelete.id);
      toast({
        title: 'Candidate deleted',
        description: `${candidateToDelete.name} has been deleted successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setCandidateToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const columns: ColumnDef<Candidate & { electionTitle: string }>[] = [
    {
      accessorKey: 'name',
      header: 'Candidate',
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={candidate.photoURL} />
              <AvatarFallback className="bg-primary-100 text-primary-800">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{candidate.name}</div>
              <div className="text-sm text-muted-foreground">{candidate.department}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'electionTitle',
      header: 'Election',
      cell: ({ row }) => (
        <Button 
          variant="link" 
          onClick={() => handleViewElection(row.original.electionId)}
          className="p-0 h-auto font-normal text-left"
        >
          {row.original.electionTitle}
        </Button>
      ),
    },
    {
      accessorKey: 'manifesto',
      header: 'Manifesto',
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.manifesto}>
          {row.original.manifesto}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Added On',
      cell: ({ row }) => format(row.original.createdAt, 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const candidate = row.original;
        
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
              <DropdownMenuItem onClick={() => handleEditCandidate(candidate.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewElection(candidate.electionId)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>View Election</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => confirmDeleteCandidate(candidate)} 
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
          data={candidatesWithElectionDetails} 
          searchKey="name"
          searchPlaceholder="Search candidates..."
        />
        
        <AlertDialog open={!!candidateToDelete} onOpenChange={() => !isDeleting && setCandidateToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {candidateToDelete?.name} from the election. This action cannot be undone.
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

export default CandidatesTable;
