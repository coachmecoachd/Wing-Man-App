
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.ts';
import { Loader2, HeartHandshake, AlertCircle } from 'lucide-react';

interface UserAuthData {
  passwordHash: string;
  salt: string;
}

interface UserRegistry {
  [username: string]: UserAuthData;
}

// Security Helpers
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface LoginProps {
  onLogin: (username: string, isNewUser: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registry, setRegistry] = useLocalStorage<UserRegistry>('wingman-user-registry', {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password) {
        setError('Please enter both username and password.');
        setIsLoading(false);
        return;
    }

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    if (isRegistering) {
        if (registry[cleanUsername]) {
            setError('Username already taken. Please choose another.');
            setIsLoading(false);
            return;
        }
        
        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);

        const newRegistry = {
            ...registry,
            [cleanUsername]: { passwordHash, salt }
        };
        setRegistry(newRegistry);
        // Pass true for isNewUser
        onLogin(cleanUsername, true);
    } else {
        // Logging in
        const user = registry[cleanUsername];
        if (!user) {
            setError('User not found. Please check your username or sign up.');
            setIsLoading(false);
            return;
        }

        const hashAttempt = await hashPassword(password, user.salt);
        if (hashAttempt === user.passwordHash) {
            // Pass false for isNewUser
            onLogin(cleanUsername, false);
        } else {
            setError('Incorrect password.');
        }
    }
    setIsLoading(false);
  };

  const handleGoogleMock = () => {
      alert("To enable Google Login, you must configure a Firebase project or Google Cloud Client ID. \n\nFor now, please use the secure Username/Password login we have implemented for this demo.");
  };

  return (
    <div className="min-h-screen bg-primary font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
             <div className="inline-block p-4 rounded-full bg-tertiary/50 mb-4 shadow-lg shadow-accent/10 border border-tertiary/50">
                <HeartHandshake size={48} className="text-accent" />
             </div>
            <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">
            Wing <span className="text-accent">Man</span>
            </h1>
            <p className="text-lg text-gray-400">Like Having Your Best Friend In Your Pocket</p>
        </div>
        
        <div className="bg-secondary/80 backdrop-blur-xl border border-tertiary/50 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6 border-b border-tertiary/50 pb-4">
             <button 
                onClick={() => { setIsRegistering(false); setError(''); }}
                className={`px-6 py-2 text-sm font-bold transition-colors ${!isRegistering ? 'text-white border-b-2 border-accent' : 'text-gray-500 hover:text-gray-300'}`}
             >
                 Sign In
             </button>
             <button 
                onClick={() => { setIsRegistering(true); setError(''); }}
                className={`px-6 py-2 text-sm font-bold transition-colors ${isRegistering ? 'text-white border-b-2 border-accent' : 'text-gray-500 hover:text-gray-300'}`}
             >
                 Sign Up
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 ml-1">Username</label>
              <input
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-primary/50 border border-tertiary/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder-gray-600"
                placeholder="e.g. date_master_99"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 ml-1">Password</label>
              <input
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-primary/50 border border-tertiary/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-accent/25 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
              ) : (
                  isRegistering ? 'Create Account' : 'Welcome Back'
              )}
            </button>
          </form>

          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-tertiary/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-secondary text-gray-500">Or continue with</span>
              </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleMock}
            className="w-full bg-white text-gray-900 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
          >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26c.01-.01.01-.01.01-.01z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
          </button>
        </div>
        
         <footer className="text-center p-4 mt-8">
          <p className="text-xs text-gray-500">
             Your data is encrypted and stored locally on this device.
          </p>
      </footer>
      </div>
    </div>
  );
};

export default Login;
