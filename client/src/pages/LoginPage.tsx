import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const { currentUser } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if already logged in
  if (currentUser) {
    if (currentUser.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
    return null;
  }

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-primary-700">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-primary-600 px-6 py-8 text-center">
          <h1 className="text-3xl font-bold text-white font-heading">PTC Voting System</h1>
          <p className="text-primary-100 mt-2">Pateros Technological College</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-primary-100 bg-primary-50 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-12 h-12 text-primary-500"
                >
                  <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Z" />
                  <path d="m9 3 9 9h-9V3Z" />
                  <path d="M12 12v6" />
                  <path d="M15 15H9" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center text-neutral-800 mb-6">
              {isLoginForm ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>

          {isLoginForm ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <RegisterForm onToggleForm={toggleForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
