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

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-400 to-blue-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const Sidebar = () => (
    <div className="w-full h-full flex flex-col py-6 px-4 border-r border-blue-100 bg-white bg-opacity-95">
      <div className="mb-6">
        <h2 className="font-semibold text-xl text-blue-900">AI Notes</h2>
      </div>
      <nav className="space-y-1 flex-1">
        <Link href="/notes" className="flex items-center px-3 py-2 text-sm rounded-md bg-blue-50 text-blue-600 font-medium">
          All Notes
        </Link>
        <Link href="/notes/favorites" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600">
          Favorites
        </Link>
        <Link href="/notes/trash" className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600">
          Trash
        </Link>
      </nav>
      <div className="pt-4 border-t border-blue-100">
        <Button variant="outline" className="w-full justify-start text-gray-700 border-blue-100 hover:bg-blue-50 hover:text-blue-600" onClick={toggleTheme}>
          {theme === 'dark' ? <SunIcon className="h-4 w-4 mr-2" /> : <MoonIcon className="h-4 w-4 mr-2" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col text-gray-800"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23DBEAFE'/%3E%3Cstop offset='1' stop-color='%23EFF6FF'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpattern id='b' width='24' height='24' patternUnits='userSpaceOnUse'%3E%3Ccircle fill='%23FFFFFF' cx='12' cy='12' r='12'/%3E%3C/pattern%3E%3Crect width='100%25' height='100%25' fill='url(%23a)'/%3E%3Crect width='100%25' height='100%25' fill='url(%23b)' fill-opacity='0.1'/%3E%3C/svg%3E")`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover'
      }}
    >
      <header className="border-b border-blue-100 bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
          )}
          
          <Link href="/notes" className="text-2xl font-bold text-blue-600">
            AI Notes
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-blue-50">
                <Avatar className="h-10 w-10 border border-blue-100">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url || ''} 
                    alt={user.email || 'User'} 
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-blue-100">
              <DropdownMenuItem className="text-gray-700">
                <span className="text-sm">{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div 
        className="flex-1 flex flex-row"
        style={{
          backgroundImage: "url('/blue-ink-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {!isMobile && (
          <aside className="w-64 hidden md:block shadow-lg">
            <Sidebar />
          </aside>
        )}
        
        <main className="flex-1 p-4 md:p-8 bg-white bg-opacity-90 shadow-md m-4 md:m-8 rounded-lg backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
}