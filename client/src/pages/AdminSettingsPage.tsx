import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const AdminSettingsPage: React.FC = () => {
  const { currentUser, isLoading, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    } else if (!isLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isLoading, isAdmin, navigate]);

  if (isLoading || !currentUser || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <MainLayout title="Admin Settings" subtitle="Configure system settings and admin preferences">
      <div className="py-4">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure general system settings for the voting platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="allow-registration" className="flex flex-col space-y-1">
                    <span>Allow Student Registration</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      When enabled, students can create new accounts
                    </span>
                  </Label>
                  <Switch id="allow-registration" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-verification" className="flex flex-col space-y-1">
                    <span>Require Email Verification</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Students must verify their email before voting
                    </span>
                  </Label>
                  <Switch id="email-verification" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="maintenance-mode" className="flex flex-col space-y-1">
                    <span>Maintenance Mode</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Temporarily disable access to the platform
                    </span>
                  </Label>
                  <Switch id="maintenance-mode" />
                </div>
                
                <div className="pt-4">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Receive important updates via email
                    </span>
                  </Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="new-voter" className="flex flex-col space-y-1">
                    <span>New Voter Alerts</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Get notified when new votes are cast
                    </span>
                  </Label>
                  <Switch id="new-voter" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="election-end" className="flex flex-col space-y-1">
                    <span>Election End Alerts</span>
                    <span className="font-normal text-sm text-muted-foreground">
                      Get notified when elections end
                    </span>
                  </Label>
                  <Switch id="election-end" defaultChecked />
                </div>
                
                <div className="pt-4">
                  <Button>Save Notification Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminSettingsPage;
