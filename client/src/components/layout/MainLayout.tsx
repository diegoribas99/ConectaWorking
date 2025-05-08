import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '@/lib/theme';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-background text-foreground">
      {/* Mobile sidebar - overlay */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={toggleSidebar}></div>
        <div className="absolute inset-y-0 left-0 w-64">
          <Sidebar onClose={toggleSidebar} onToggleTheme={toggleTheme} />
        </div>
      </div>

      {/* Desktop sidebar - fixed */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:fixed lg:h-full">
        <Sidebar onToggleTheme={toggleTheme} />
      </div>

      {/* Main content - with padding for sidebar on desktop */}
      <div className="flex-1 flex flex-col h-full overflow-hidden lg:pl-64">
        {/* Novo Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-secondary">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
