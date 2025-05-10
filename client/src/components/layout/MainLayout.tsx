import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { LogOut, Home, Calendar, Settings, Menu, X, User, Activity, Users, BarChart2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title, subtitle }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
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

  const isActive = (path: string) => {
    return location === path;
  };

  const studentNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/my-votes', label: 'My Votes', icon: <Activity size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/admin/elections', label: 'Elections', icon: <Calendar size={20} /> },
    { path: '/admin/candidates', label: 'Candidates', icon: <Users size={20} /> },
    { path: '/admin/students', label: 'Students', icon: <User size={20} /> },
    { path: '/admin/reports', label: 'Reports', icon: <BarChart2 size={20} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-100">
      {/* Sidebar (desktop) */}
      <div className={cn(
        "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0",
        isAdmin ? "bg-neutral-800" : "bg-primary-700"
      )}>
        <div className={cn(
          "flex items-center h-16 px-4", 
          isAdmin ? "bg-neutral-900" : "bg-primary-800"
        )}>
          <h1 className="text-xl font-bold text-white">
            {isAdmin ? "PTC Admin Panel" : "PTC Voting System"}
          </h1>
        </div>
        <div className="flex flex-col flex-grow p-4 overflow-y-auto">
          <div className="flex items-center mb-8 px-2">
            <div className={cn(
              "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-center font-bold",
              isAdmin 
                ? "bg-yellow-500 text-neutral-800" 
                : "bg-primary-300 text-primary-800"
            )}>
              {getInitials()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{currentUser?.displayName || currentUser?.email}</p>
              <p className={cn(
                "text-xs font-medium",
                isAdmin ? "text-neutral-300" : "text-primary-200"
              )}>
                {currentUser?.studentId || (isAdmin ? "Administrator" : "")}
              </p>
            </div>
          </div>

          <nav className="mt-5 flex-1 space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                href={item.path}
              >
                <a className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive(item.path)
                    ? isAdmin 
                      ? "bg-neutral-900 text-white" 
                      : "bg-primary-800 text-white"
                    : isAdmin
                      ? "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      : "text-primary-100 hover:bg-primary-600 hover:text-white"
                )}>
                  <span className="mr-3 h-6 w-6">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <button 
              className={cn(
                "w-full flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isAdmin
                  ? "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  : "text-primary-100 hover:bg-primary-600 hover:text-white"
              )}
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-6 w-6" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className={cn(
        "md:hidden text-white",
        isAdmin ? "bg-neutral-800" : "bg-primary-700"
      )}>
        <div className="flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold">{isAdmin ? "PTC Admin" : "PTC Voting"}</h1>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className={cn(
              "p-1 rounded-md",
              isAdmin ? "hover:bg-neutral-700" : "hover:bg-primary-600"
            )}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={cn(
            "px-2 pt-2 pb-3 space-y-1 sm:px-3",
            mobileMenuOpen ? "block" : "hidden"
          )}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
              >
                <a className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  isActive(item.path)
                    ? isAdmin
                      ? "bg-neutral-900 text-white"
                      : "bg-primary-800 text-white"
                    : isAdmin
                      ? "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                      : "text-primary-100 hover:bg-primary-600 hover:text-white"
                )}>
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </div>
                </a>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className={cn(
                "w-full text-left block px-3 py-2 rounded-md text-base font-medium",
                isAdmin
                  ? "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  : "text-primary-100 hover:bg-primary-600 hover:text-white"
              )}
            >
              <div className="flex items-center">
                <LogOut className="mr-3" size={20} />
                Logout
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-neutral-900 font-heading">{title}</h1>
              {subtitle && <p className="mt-1 text-neutral-500">{subtitle}</p>}
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
