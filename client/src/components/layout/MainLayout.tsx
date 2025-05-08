import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '@/lib/theme';
import { Menu, User } from 'lucide-react';

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
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={toggleSidebar}></div>
        <div className="absolute inset-y-0 left-0 w-64">
          <Sidebar onClose={toggleSidebar} onToggleTheme={toggleTheme} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0">
        <Sidebar onToggleTheme={toggleTheme} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4 flex items-center">
          <button 
            className="lg:hidden mr-4 text-muted-foreground hover:text-foreground"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-lg font-semibold lg:hidden">
            <span className="text-primary">Conecta</span>Working
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="font-medium text-primary-foreground">AM</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-secondary">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
