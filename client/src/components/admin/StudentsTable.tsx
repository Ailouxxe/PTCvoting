import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
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
import { Pencil, MoreHorizontal, Trash2, ShieldAlert, Shield, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  studentId: string;
  role: string;
  createdAt: Date;
}

const StudentsTable: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // Query Firestore for all users with role "student"
        const studentsQuery = query(
          collection(firestore, 'users'),
          where('role', '==', 'student'),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(studentsQuery);
        const studentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          uid: doc.data().uid,
          email: doc.data().email,
          displayName: doc.data().displayName || '',
          studentId: doc.data().studentId || '',
          role: doc.data().role,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Student[];
        
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'Failed to load student data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [toast]);

  const handlePromoteToAdmin = async (student: Student) => {
    try {
      const userRef = doc(firestore, 'users', student.id);
      await updateDoc(userRef, { role: 'admin' });
      
      // Update local state
      setStudents(prev => 
        prev.map(s => s.id === student.id ? { ...s, role: 'admin' } : s)
      );
      
      toast({
        title: 'Success',
        description: `${student.displayName || student.email} has been promoted to admin`,
      });
    } catch (error) {
      console.error('Error promoting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to promote student to admin',
        variant: 'destructive',
      });
    }
  };

  const handleDemoteToStudent = async (student: Student) => {
    try {
      const userRef = doc(firestore, 'users', student.id);
      await updateDoc(userRef, { role: 'student' });
      
      // Update local state
      setStudents(prev => 
        prev.map(s => s.id === student.id ? { ...s, role: 'student' } : s)
      );
      
      toast({
        title: 'Success',
        description: `${student.displayName || student.email} has been demoted to student`,
      });
    } catch (error) {
      console.error('Error demoting admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to demote admin to student',
        variant: 'destructive',
      });
    }
  };

  const confirmDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    
    try {
      // Delete the user document from Firestore
      await deleteDoc(doc(firestore, 'users', studentToDelete.id));
      
      // Update local state
      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      
      toast({
        title: 'Success',
        description: `${studentToDelete.displayName || studentToDelete.email} has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setStudentToDelete(null);
    }
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'displayName',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.displayName || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'studentId',
      header: 'Student ID',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={row.original.role === 'admin' ? 'default' : 'secondary'}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Registered On',
      cell: ({ row }) => format(row.original.createdAt, 'PPP'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const student = row.original;
        
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
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${student.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                <span>Email Student</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {student.role === 'student' ? (
                <DropdownMenuItem onClick={() => handlePromoteToAdmin(student)}>
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  <span>Promote to Admin</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleDemoteToStudent(student)}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Demote to Student</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => confirmDeleteStudent(student)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete Account</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <DataTable 
          columns={columns} 
          data={students} 
          searchKey="email"
          searchPlaceholder="Search by email or name..."
        />
        
        <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {studentToDelete?.displayName || studentToDelete?.email}'s
                account and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStudent} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default StudentsTable;
