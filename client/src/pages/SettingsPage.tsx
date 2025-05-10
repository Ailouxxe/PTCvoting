import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import ProfileSettings from '@/components/settings/ProfileSettings';

const SettingsPage: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <MainLayout title="Settings" subtitle="Manage your account settings and preferences">
      <div className="py-4">
        <ProfileSettings />
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
