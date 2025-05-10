import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

// Profile info schema
const profileSchema = z.object({
  displayName: z.string().min(3, 'Name must be at least 3 characters'),
  studentId: z.string().regex(/^\d{4}-\d{5}$/, 'Student ID should be in format: 20XX-XXXXX'),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/.*[0-9].*/, 'Password must contain at least 1 number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfileSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: currentUser?.displayName || '',
      studentId: currentUser?.studentId || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!currentUser || !auth.currentUser) return;
    
    setIsUpdatingProfile(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: values.displayName,
      });
      
      // Update Firestore document
      const userRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: values.displayName,
        studentId: values.studentId,
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    if (!auth.currentUser || !auth.currentUser.email) return;
    
    setIsChangingPassword(true);
    try {
      // Re-authenticate the user first
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        values.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Change password
      await updatePassword(auth.currentUser, values.newPassword);
      
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      });
      
      // Reset form
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      // Handle specific error types
      if (error.code === 'auth/wrong-password') {
        toast({
          title: 'Error',
          description: 'Current password is incorrect',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = () => {
    if (!currentUser?.displayName) return 'U';
    return currentUser.displayName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details and account information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="text-xl bg-primary-100 text-primary-800">{getInitials()}</AvatarFallback>
              </Avatar>
            </div>

            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="20XX-XXXXX" />
                      </FormControl>
                      <FormDescription>
                        Your official student identification number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>
              Your verified email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentUser?.email}</p>
                <p className="text-sm text-muted-foreground">
                  This is your verified college email address
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Verified</Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters with at least 1 number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// We need to import Badge separately since it's used within the component
import { Badge } from '@/components/ui/badge';

export default ProfileSettings;
