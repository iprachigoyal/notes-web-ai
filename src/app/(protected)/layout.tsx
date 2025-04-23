'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { MoonIcon, SunIcon, MenuIcon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [user, loading, router]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        isDark ? 'bg-gradient-to-br from-gray-900 to-gray-950' : 'bg-gradient-to-br from-blue-400 to-blue-600'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const Sidebar = () => (
    <div className={`w-full h-full flex flex-col py-6 px-4 border-r ${
      isDark 
        ? 'border-gray-800 bg-gray-950 text-gray-200' 
        : 'border-blue-100 bg-white bg-opacity-95'
    }`}>
      <div className="mb-6">
        <h2 className={`font-semibold text-xl ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>AI Notes</h2>
      </div>
      <nav className="space-y-1 flex-1">
        <Link href="/notes" className={`flex items-center px-3 py-2 text-sm rounded-md ${
          isDark 
            ? 'bg-gray-800 text-blue-300 font-medium hover:bg-gray-700' 
            : 'bg-blue-50 text-blue-600 font-medium hover:bg-blue-100'
        }`}>
          All Notes
        </Link>
        {/* Additional nav items would go here */}
      </nav>
      <div className={`pt-4 border-t ${isDark ? 'border-gray-800' : 'border-blue-100'}`}>
        <Button 
          variant="outline" 
          className={`w-full justify-start ${
            isDark 
              ? 'text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-blue-300' 
              : 'text-gray-700 border-blue-100 hover:bg-blue-50 hover:text-blue-600'
          }`} 
          onClick={toggleTheme}
        >
          {isDark ? <SunIcon className="h-4 w-4 mr-2" /> : <MoonIcon className="h-4 w-4 mr-2" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
    </div>
  );

  return (
    <div 
      className={`min-h-screen flex flex-col ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
      style={{
        backgroundColor: isDark ? '#121212' : '#ffffff',
        backgroundImage: isDark 
          ? 'radial-gradient(circle at 25% 25%, rgba(30, 41, 59, 0.5) 0%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at 75% 75%, rgba(30, 41, 59, 0.5) 0%, rgba(0, 0, 0, 0) 50%)'
          : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23DBEAFE'/%3E%3Cstop offset='1' stop-color='%23EFF6FF'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='24' height='24' patternUnits='userSpaceOnUse'%3E%3Ccircle fill='%23FFFFFF' cx='12' cy='12' r='12'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23b)' fill-opacity='0.1'/%3E%3C/svg%3E")`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover'
      }}
    >
      <header className={`border-b backdrop-blur-sm ${
        isDark 
          ? 'border-gray-800 bg-gray-950' 
          : 'border-blue-100 bg-white/95'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={isDark ? 'text-blue-300 hover:bg-gray-800' : 'text-blue-600 hover:bg-blue-50'}
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className={`p-0 ${isDark ? 'bg-gray-950 border-gray-800' : ''}`}>
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}
          
          <Link href="/notes" className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
            AI Notes
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={`relative h-10 w-10 rounded-full ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-blue-50'
                }`}
              >
                <Avatar className={`h-10 w-10 border ${isDark ? 'border-gray-700' : 'border-blue-100'}`}>
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url || ''} 
                    alt={user.email || 'User'} 
                  />
                  <AvatarFallback className={
                    isDark 
                      ? 'bg-gray-800 text-blue-300' 
                      : 'bg-blue-100 text-blue-600'
                  }>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className={isDark ? 'border-gray-800 bg-gray-900' : 'border-blue-100 bg-white'}
            >
              <DropdownMenuItem className={isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-blue-50'}>
                <span className="text-sm">{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className={
                  isDark 
                    ? 'text-gray-300 hover:text-blue-300 hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="flex-1 flex flex-row">
        {!isMobile && (
          <aside className="w-64 hidden md:block shadow-lg z-10">
            <Sidebar />
          </aside>
        )}
        
        <main className={`flex-1 p-4 md:p-8 shadow-md m-4 md:m-8 rounded-lg ${
          isDark 
            ? 'bg-gray-900/90 backdrop-blur-sm border border-gray-800' 
            : 'bg-white/90 backdrop-blur-sm'
        }`}
        style={{
          backgroundImage: isDark 
            ? 'linear-gradient(to bottom right, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))'
            : 'none',
        }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}