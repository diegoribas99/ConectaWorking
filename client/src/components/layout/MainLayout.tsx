import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useMediaQuery } from '../../hooks/use-media-query';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Sidebar - visible on large screens */}
      {isDesktop && (
        <div className={`fixed left-0 top-0 h-full ${isSidebarOpen ? 'w-64' : 'w-[70px]'} transition-all duration-300 z-30`}>
          <Sidebar collapsed={!isSidebarOpen} />
        </div>
      )}

      {/* Mobile Sidebar - Overlay when opened */}
      {!isDesktop && isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeMobileSidebar}></div>
      )}

      {/* Mobile Sidebar - Slide in from left */}
      {!isDesktop && (
        <div className={`fixed left-0 top-0 h-full w-64 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
          <Sidebar onClose={closeMobileSidebar} />
        </div>
      )}

      {/* Main content area */}
      <div 
        className={`flex flex-col flex-1 ${isDesktop ? (isSidebarOpen ? 'ml-64' : 'ml-[70px]') : 'ml-0'} transition-all duration-300`}
      >
        <Header 
          toggleSidebar={isDesktop ? toggleSidebar : toggleMobileSidebar} 
          isSidebarOpen={isDesktop ? isSidebarOpen : isMobileSidebarOpen}
          isDesktop={isDesktop}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;