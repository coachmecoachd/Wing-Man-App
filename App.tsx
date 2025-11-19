
import React, { useState, useEffect } from 'react';
import { View, PersonProfile, PlannedDate, UserAccount } from './types.ts';
import useLocalStorage from './hooks/useLocalStorage.ts';
import Header from './components/Header.tsx';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import ProfileManager from './components/ProfileManager.tsx';
import TextAnalyzer from './components/TextAnalyzer.tsx';
import DatePlanner from './components/DatePlanner.tsx';
import GiftLab from './components/GiftLab.tsx';
import DatingAdvice from './components/DatingAdvice.tsx';
import Interpreter from './components/Interpreter.tsx';
import Login from './components/Login.tsx';
import UserSettings from './components/UserSettings.tsx';
import Tutorial from './components/Tutorial.tsx';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>('wingman-currentUser', null);
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State to pass a profile from Manager to Planner
  const [planningProfile, setPlanningProfile] = useState<PersonProfile | null>(null);

  // Data is now scoped by user. Keys will change when user logs in/out.
  const profileKey = currentUser ? `${currentUser}-wingman-profiles` : 'anonymous-profiles';
  const dateKey = currentUser ? `${currentUser}-wingman-dates` : 'anonymous-dates';
  const accountKey = currentUser ? `${currentUser}-wingman-account` : 'anonymous-account';
  const tutorialKey = currentUser ? `${currentUser}-wingman-tutorial-seen` : 'anonymous-tutorial-seen';

  const [profiles, setProfiles] = useLocalStorage<PersonProfile[]>(profileKey, []);
  const [dates, setDates] = useLocalStorage<PlannedDate[]>(dateKey, []);
  const [userAccount, setUserAccount] = useLocalStorage<UserAccount>(accountKey, {
      username: currentUser || '',
      displayName: currentUser || '',
      avatarUrl: '',
      zipCode: ''
  });
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage<boolean>(tutorialKey, false);


  // Sync userAccount username with currentUser on login
  useEffect(() => {
      if (currentUser && userAccount.username !== currentUser) {
          setUserAccount(prev => ({...prev, username: currentUser, displayName: prev.displayName || currentUser}));
      }
  }, [currentUser, userAccount.username, setUserAccount]);


  // When user logs out, reset view to dashboard
  useEffect(() => {
    if (!currentUser) {
      setView('dashboard');
    }
  }, [currentUser]);

  const handleLogin = (username: string, isNewUser: boolean) => {
    // Logic to prevent tutorial from showing for returning users.
    // We manually set the localStorage item *before* the state triggers the hook update.
    const tutKey = `${username}-wingman-tutorial-seen`;
    if (!isNewUser) {
      // If returning user, mark as seen immediately so the tutorial doesn't flash or appear.
      localStorage.setItem(tutKey, 'true');
    } else {
      // If new user, ensure it's false so they see it.
      localStorage.setItem(tutKey, 'false');
    }
    
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDeleteAccount = () => {
    if (currentUser) {
        // Manually remove the items from localStorage since the hooks sync with state, 
        // but we want to ensure the data is gone from the browser storage.
        localStorage.removeItem(`${currentUser}-wingman-profiles`);
        localStorage.removeItem(`${currentUser}-wingman-dates`);
        localStorage.removeItem(`${currentUser}-wingman-account`);
        localStorage.removeItem(`${currentUser}-wingman-tutorial-seen`);
        
        // Also remove from registry
        const registry = JSON.parse(localStorage.getItem('wingman-user-registry') || '{}');
        delete registry[currentUser];
        localStorage.setItem('wingman-user-registry', JSON.stringify(registry));

        handleLogout();
    }
  };

  const handlePlanDate = (profile: PersonProfile) => {
      setPlanningProfile(profile);
      setView('planner');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }


  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} />;
      case 'profiles':
        return <ProfileManager profiles={profiles} setProfiles={setProfiles} userZip={userAccount.zipCode} onPlanDate={handlePlanDate} />;
      case 'texter':
        return <TextAnalyzer />;
      case 'planner':
        return <DatePlanner dates={dates} setDates={setDates} profiles={profiles} initialProfile={planningProfile} onClearInitialProfile={() => setPlanningProfile(null)} />;
      case 'gifts':
        return <GiftLab profiles={profiles} userZip={userAccount.zipCode} />;
      case 'advice':
        return <DatingAdvice />;
      case 'interpreter':
        return <Interpreter />;
      case 'settings':
        return <UserSettings userAccount={userAccount} onSave={(updated) => { setUserAccount(updated); setView('dashboard'); }} onDeleteAccount={handleDeleteAccount} onReplayTutorial={() => setHasSeenTutorial(false)} />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary font-sans flex text-white">
      {!hasSeenTutorial && <Tutorial onComplete={() => setHasSeenTutorial(true)} />}
      <Sidebar
        currentView={view}
        setView={setView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onLogout={handleLogout}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userAccount={userAccount}
          onOpenSettings={() => setView('settings')}
        />
        <main className="flex-grow overflow-y-auto">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderView()}
            </div>
             <footer className="bg-primary text-center p-4 mt-8">
              <p className="text-sm text-gray-400">
                  Wing Man &copy; {new Date().getFullYear()} | <a href="./privacy-policy.html" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Privacy Policy</a>
              </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
