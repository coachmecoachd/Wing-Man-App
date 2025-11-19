
import React from 'react';
import { View } from '../types.ts';
import useLocalStorage from '../hooks/useLocalStorage.ts';
import { 
  LayoutDashboard, 
  MessageSquareMore, 
  CalendarHeart, 
  UsersRound, 
  Sparkles, 
  Gift, 
  Languages, 
  Settings,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const icons: { [key in View]: React.ReactNode } = {
    dashboard: <LayoutDashboard size={22} />,
    texter: <MessageSquareMore size={22} />,
    planner: <CalendarHeart size={22} />,
    profiles: <UsersRound size={22} />,
    advice: <Sparkles size={22} />,
    gifts: <Gift size={22} />,
    interpreter: <Languages size={22} />,
    settings: <Settings size={22} />,
};

const navItems: { label: string; viewName: View }[] = [
    { label: 'Dashboard', viewName: 'dashboard' },
    { label: 'Text Helper', viewName: 'texter' },
    { label: 'Date Planner', viewName: 'planner' },
    { label: 'Profiles', viewName: 'profiles' },
    { label: 'Advice', viewName: 'advice' },
    { label: 'Gift Lab', viewName: 'gifts' },
    { label: 'Interpreter', viewName: 'interpreter' },
    { label: 'Settings', viewName: 'settings' },
];

const NavLink: React.FC<{
  label: string;
  viewName: View;
  currentView: View;
  setView: (view: View) => void;
  icon: React.ReactNode;
  isCollapsed: boolean;
}> = ({ label, viewName, currentView, setView, icon, isCollapsed }) => (
  <li className="px-2 py-1 relative group">
    <button
      onClick={() => setView(viewName)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        currentView === viewName
          ? 'bg-accent text-white shadow-md shadow-accent/20'
          : 'text-gray-400 hover:bg-tertiary hover:text-white'
      } ${isCollapsed ? 'justify-center' : ''}`}
      aria-current={currentView === viewName ? 'page' : undefined}
      aria-label={label}
    >
      <span className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
      <span 
        className={`flex-1 text-left whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
        }`}
      >
        {label}
      </span>
    </button>
    
    {/* Floating Tooltip for Collapsed State */}
    {isCollapsed && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-secondary text-white text-xs font-semibold rounded-lg shadow-xl border border-tertiary opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap transform translate-x-2 group-hover:translate-x-0">
        {label}
        {/* Little arrow pointing left */}
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-secondary border-l border-b border-tertiary transform rotate-45"></div>
      </div>
    )}
  </li>
);


const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isSidebarOpen, setIsSidebarOpen }) => {
    const [isCollapsed, setIsCollapsed] = useLocalStorage('wingman-sidebar-collapsed', false);

    const sidebarClasses = `
        bg-secondary/95 backdrop-blur-md flex flex-col z-30 transition-all duration-300 ease-in-out border-r border-tertiary/50
        ${isCollapsed ? 'w-20' : 'w-72'}
        lg:relative lg:translate-x-0
        fixed h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            />
            
            <aside className={sidebarClasses}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-24 px-4 flex-shrink-0 transition-all duration-300`}>
                     <div className={`font-bold text-white flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
                        <div className="bg-gradient-to-br from-accent to-pink-600 text-white p-2 rounded-lg">
                            <UsersRound size={24} />
                        </div>
                        <div>
                             <span className="block text-lg leading-none">Wing</span>
                             <span className="block text-lg leading-none text-accent">Man</span>
                        </div>
                    </div>
                    
                    {/* Logo icon when collapsed */}
                    {isCollapsed && (
                        <div className="flex justify-center animate-fade-in">
                            <div className="bg-gradient-to-br from-accent to-pink-600 text-white p-2.5 rounded-xl shadow-lg shadow-accent/20">
                                <span className="font-extrabold text-xl">W</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Mobile close button (only visible on mobile when open) */}
                     <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <ChevronsLeft size={24} />
                    </button>

                     {/* Desktop collapse button */}
                     <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden lg:flex text-gray-400 hover:text-white items-center justify-center w-8 h-8 rounded-full hover:bg-tertiary transition-colors ${isCollapsed ? 'absolute -right-4 top-8 bg-secondary border border-tertiary shadow-md text-accent z-50' : ''}`}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                         {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={20} />}
                    </button>
                </div>

                <nav className="flex-grow mt-2 overflow-y-auto scrollbar-hide px-2">
                    <ul className="space-y-1">
                        {navItems.map(({label, viewName}) => (
                           <NavLink
                                key={viewName}
                                label={label}
                                viewName={viewName}
                                currentView={currentView}
                                setView={setView}
                                icon={icons[viewName]}
                                isCollapsed={isCollapsed}
                           />
                        ))}
                    </ul>
                </nav>
                
                <div className="p-6 text-xs text-center text-gray-600 border-t border-tertiary/30">
                    <p className={`${isCollapsed ? 'hidden' : 'block'} transition-opacity duration-300`}>
                        Made with ❤️ by Wing Man
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
