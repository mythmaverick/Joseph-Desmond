import React, { useState } from 'react';
import { MessageSquare, Eye, Image as ImageIcon, Sparkles } from 'lucide-react';
import { AppMode } from './types';
import { ChatMode } from './components/ChatMode';
import { VisionMode } from './components/VisionMode';
import { ImageGenMode } from './components/ImageGenMode';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);

  const renderContent = () => {
    switch (mode) {
      case AppMode.CHAT:
        return <ChatMode />;
      case AppMode.VISION:
        return <VisionMode />;
      case AppMode.IMAGE_GEN:
        return <ImageGenMode />;
      default:
        return <ChatMode />;
    }
  };

  const NavItem = ({ 
    activeMode, 
    targetMode, 
    icon: Icon, 
    label 
  }: { 
    activeMode: AppMode; 
    targetMode: AppMode; 
    icon: React.ElementType; 
    label: string 
  }) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all w-full ${
        activeMode === targetMode
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={24} strokeWidth={activeMode === targetMode ? 2.5 : 2} />
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <nav className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 z-10 shadow-sm flex-shrink-0">
        <div className="mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Sparkles size={24} />
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full px-2">
          <NavItem activeMode={mode} targetMode={AppMode.CHAT} icon={MessageSquare} label="Chat" />
          <NavItem activeMode={mode} targetMode={AppMode.VISION} icon={Eye} label="Vision" />
          <NavItem activeMode={mode} targetMode={AppMode.IMAGE_GEN} icon={ImageIcon} label="Create" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 h-full overflow-hidden">
        <div className="h-full max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
