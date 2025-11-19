
import React from 'react';
import { UserAccount } from '../types.ts';
import { Menu, LogOut, User } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
  toggleSidebar: () => void;
  userAccount: UserAccount;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, toggleSidebar, userAccount, onOpenSettings }) => {
  return (
    <header className="bg-secondary/95 backdrop-blur-sm shadow-md sticky top-0 z-20 flex-shrink-0 border-b border-tertiary/50">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side: Hamburger for mobile */}
        <div className="flex items-center">
           <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-white focus:outline-none p-2 rounded-md hover:bg-tertiary transition-colors"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Right side: User Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 group focus:outline-none p-1 pr-3 rounded-full hover:bg-tertiary/50 transition-colors"
            aria-label="User Profile"
          >
            {userAccount.avatarUrl ? (
                 <img src={userAccount.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-tertiary group-hover:border-accent transition-colors" />
            ) : (
                <div className="w-8 h-8 bg-tertiary rounded-full flex items-center justify-center font-bold text-white text-sm border-2 border-tertiary group-hover:border-accent group-hover:bg-accent transition-all">
                   <User size={16} />
                </div>
            )}
            <span className="text-gray-300 text-sm font-medium hidden sm:block group-hover:text-white transition-colors">
              {userAccount.displayName || userAccount.username}
            </span>
          </button>
          
          <div className="h-6 w-px bg-tertiary mx-1"></div>
          
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-red-400 p-2 rounded-full hover:bg-tertiary transition-colors"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
