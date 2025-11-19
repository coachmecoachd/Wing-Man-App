
import React, { useState } from 'react';
import { PersonProfile } from '../types.ts';
import { generateDateIdeas } from '../services/geminiService.ts';
import ReactMarkdown from 'react-markdown';
import { Camera, ArrowLeft, Edit, Trash2, Plus, User, Sparkles, StickyNote, Save, MapPin, Briefcase, CalendarHeart, ArrowRight } from 'lucide-react';

const ProfileForm: React.FC<{
  profile: PersonProfile;
  onSave: (profile: PersonProfile) => void;
  onCancel: () => void;
}> = ({ profile: initialProfile, onSave, onCancel }) => {
  const [profile, setProfile] = useState(initialProfile);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };

  const handleRandomizeAvatar = () => {
    const randomId = Math.floor(Math.random() * 10000);
    setProfile(prev => ({
        ...prev,
        avatarUrl: `https://picsum.photos/seed/${randomId}/200`
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile(prev => ({
                ...prev,
                avatarUrl: reader.result as string
            }));
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-white relative pb-20">
      
      {/* SECTION 1: BASIC INFO */}
      <div className="bg-primary/30 p-6 rounded-2xl border border-tertiary/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-tertiary/30 pb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <User size={20} />
            </div>
            <h3 className="text-lg font-bold tracking-wide">Basic Information</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
             {/* Avatar Column */}
             <div className="flex flex-col items-center space-y-3">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full p-1 border-2 border-dashed border-tertiary hover:border-accent transition-colors">
                         <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full rounded-full object-cover bg-tertiary" />
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                         <Camera size={28} className="text-white drop-shadow-lg" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                </div>
                 <button 
                  type="button" 
                  onClick={handleRandomizeAvatar}
                  className="text-xs font-medium text-accent hover:text-white transition-colors flex items-center gap-1"
                >
                  <Sparkles size={12} /> Randomize
                </button>
            </div>

            {/* Inputs Column */}
            <div className="flex-grow space-y-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-gray-600" placeholder="e.g. Sarah Connor" required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="occupation" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Occupation</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase size={16} className="text-gray-500" />
                            </div>
                            <input type="text" name="occupation" id="occupation" value={profile.occupation} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 pl-10 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-gray-600" placeholder="e.g. Graphic Designer" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="zipCode" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Zip Code</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin size={16} className="text-gray-500" />
                            </div>
                            <input type="text" name="zipCode" id="zipCode" value={profile.zipCode || ''} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 pl-10 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-gray-600" placeholder="e.g. 90210" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* SECTION 2: PERSONALITY */}
      <div className="bg-primary/30 p-6 rounded-2xl border border-tertiary/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-tertiary/30 pb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold tracking-wide">Personality & Interests</h3>
        </div>

        <div className="space-y-5">
            <div>
                <label htmlFor="description" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                    AI Bio <span className="normal-case text-gray-500 font-normal italic ml-2">- Used for generating personalized advice</span>
                </label>
                <textarea name="description" id="description" rows={3} value={profile.description} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-gray-600" placeholder="Describe them! e.g., A kind-hearted software engineer who loves hiking, indie music, and trying new coffee shops."></textarea>
            </div>

            <div>
                <label htmlFor="hobbies" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Hobbies</label>
                <input type="text" name="hobbies" id="hobbies" value={profile.hobbies} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-gray-600" placeholder="e.g., Playing guitar, pottery, rock climbing" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="likes" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 text-green-400">Likes</label>
                    <textarea name="likes" id="likes" rows={3} value={profile.likes} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-600" placeholder="e.g., Spicy food, old movies, dogs"></textarea>
                </div>
                <div>
                    <label htmlFor="dislikes" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 text-red-400">Dislikes</label>
                    <textarea name="dislikes" id="dislikes" rows={3} value={profile.dislikes} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder-gray-600" placeholder="e.g., Loud bars, cilantro, traffic"></textarea>
                </div>
            </div>
        </div>
      </div>

      {/* SECTION 3: NOTES */}
      <div className="bg-primary/30 p-6 rounded-2xl border border-tertiary/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-tertiary/30 pb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                <StickyNote size={20} />
            </div>
            <h3 className="text-lg font-bold tracking-wide">Private Notes</h3>
        </div>
         <div>
            <label htmlFor="notes" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Things to remember</label>
            <textarea name="notes" id="notes" rows={4} value={profile.notes || ''} onChange={handleChange} className="block w-full bg-secondary border border-tertiary/50 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder-gray-600" placeholder="e.g., Allergic to peanuts, birthday is in June, prefers text over call."></textarea>
        </div>
      </div>
      
      {/* STICKY ACTIONS */}
      <div className="sticky bottom-4 z-10 flex justify-end gap-3 p-4 bg-secondary/90 backdrop-blur-md border border-tertiary/50 rounded-xl shadow-2xl">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg text-gray-300 font-medium hover:bg-tertiary transition-colors">
            Cancel
        </button>
        <button type="submit" className="flex items-center gap-2 bg-accent text-white px-8 py-2.5 rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-accent/20 font-bold">
            <Save size={18} />
            Save Profile
        </button>
      </div>
    </form>
  );
};


const ProfileDetail: React.FC<{
  profile: PersonProfile;
  onBack: () => void;
  onUpdateProfile: (profile: PersonProfile) => void;
  userZip?: string;
}> = ({ profile, onBack, onUpdateProfile, userZip }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [dateIdeas, setDateIdeas] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateIdeas = async () => {
        setIsLoading(true);
        setDateIdeas('');
        const ideas = await generateDateIdeas(profile, userZip);
        setDateIdeas(ideas);
        setIsLoading(false);
    };

    const handleSave = (updatedProfile: PersonProfile) => {
        onUpdateProfile(updatedProfile);
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-tertiary transition-colors text-gray-400">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold">Edit Profile</h2>
                </div>
                <ProfileForm profile={profile} onSave={handleSave} onCancel={() => setIsEditing(false)} />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                    <ArrowLeft size={18} />
                    Back to Profiles
                </button>
                 <button onClick={() => setIsEditing(true)} className="bg-tertiary text-white px-4 py-2 rounded-lg hover:bg-secondary flex items-center gap-2 transition-colors border border-tertiary/50">
                   <Edit size={16} />
                    Edit Profile
                </button>
            </div>

            <div className="bg-secondary p-6 sm:p-8 rounded-2xl shadow-xl border border-tertiary/50 flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 text-center md:text-left flex flex-col items-center md:items-start">
                    <img src={profile.avatarUrl} alt={profile.name} className="w-40 h-40 rounded-full object-cover bg-tertiary border-4 border-tertiary shadow-lg" />
                    <h2 className="text-3xl font-extrabold mt-4 text-white tracking-tight">{profile.name}</h2>
                    <p className="text-accent font-medium text-lg">{profile.occupation}</p>
                    {profile.zipCode && (
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-2 bg-primary/40 px-3 py-1 rounded-full">
                            <MapPin size={12} /> 
                            {profile.zipCode}
                        </div>
                    )}
                </div>
                
                <div className="md:border-l border-tertiary/50 md:pl-8 flex-grow space-y-6">
                     <div className="relative">
                        <Sparkles className="absolute -top-2 -left-3 text-accent/20 w-8 h-8" />
                        <p className="italic text-gray-300 text-lg leading-relaxed font-serif relative z-10">"{profile.description}"</p>
                     </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                        <div className="bg-primary/30 p-4 rounded-xl border border-tertiary/30">
                            <strong className="text-green-400 block uppercase text-xs tracking-widest mb-2 font-bold">Likes</strong> 
                            <p className="text-gray-300 leading-relaxed">{profile.likes}</p>
                        </div>
                        <div className="bg-primary/30 p-4 rounded-xl border border-tertiary/30">
                            <strong className="text-red-400 block uppercase text-xs tracking-widest mb-2 font-bold">Dislikes</strong> 
                            <p className="text-gray-300 leading-relaxed">{profile.dislikes}</p>
                        </div>
                        <div className="sm:col-span-2 bg-primary/30 p-4 rounded-xl border border-tertiary/30">
                            <strong className="text-blue-400 block uppercase text-xs tracking-widest mb-2 font-bold">Hobbies</strong> 
                            <p className="text-gray-300 leading-relaxed">{profile.hobbies}</p>
                        </div>
                        {profile.notes && (
                            <div className="sm:col-span-2 bg-yellow-900/10 p-4 rounded-xl border border-yellow-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <StickyNote size={14} className="text-yellow-500" />
                                    <strong className="text-yellow-500 uppercase text-xs tracking-widest font-bold">Private Notes</strong> 
                                </div>
                                <p className="text-gray-300 leading-relaxed">{profile.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-secondary to-tertiary/30 p-6 sm:p-8 rounded-2xl shadow-lg border border-tertiary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2 text-white">Date Ideas</h3>
                    <p className="text-gray-400 mb-6 text-sm">Let the AI brainstorm the perfect date based on {profile.name}'s personality.</p>
                    
                    <button onClick={handleGenerateIdeas} disabled={isLoading} className="bg-accent text-white px-6 py-3 rounded-xl hover:bg-red-600 disabled:bg-gray-600 w-full sm:w-auto transition-all shadow-lg font-bold flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>Thinking...</>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                Generate Ideas for {profile.name}
                            </>
                        )}
                    </button>
                    
                    {isLoading && (
                         <div className="mt-8 space-y-3 animate-pulse">
                            <div className="h-4 bg-tertiary rounded w-3/4"></div>
                            <div className="h-4 bg-tertiary rounded w-1/2"></div>
                            <div className="h-4 bg-tertiary rounded w-5/6"></div>
                         </div>
                    )}
                    
                    {dateIdeas && (
                        <div className="mt-8 p-6 bg-primary/60 backdrop-blur rounded-xl border border-tertiary/50 prose prose-invert max-w-none prose-h3:text-accent prose-strong:text-white prose-li:marker:text-accent">
                            <ReactMarkdown>{dateIdeas}</ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProfileList: React.FC<{
  profiles: PersonProfile[];
  onSelectProfile: (profile: PersonProfile) => void;
  onAddProfile: () => void;
  onDeleteProfile: (id: string) => void;
}> = ({ profiles, onSelectProfile, onAddProfile, onDeleteProfile }) => {
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-white">Your Profiles</h2>
                    <p className="text-gray-400 mt-1">Manage the important people in your dating life.</p>
                </div>
                <button onClick={onAddProfile} className="bg-accent text-white px-5 py-2.5 rounded-xl hover:bg-red-600 flex items-center gap-2 transition-all shadow-lg shadow-accent/20 font-bold active:scale-95">
                    <Plus size={20} />
                    Create Profile
                </button>
            </div>
            
            {profiles.length === 0 ? (
                <div className="text-center py-20 bg-secondary/30 rounded-2xl border-2 border-dashed border-tertiary/50 flex flex-col items-center justify-center">
                    <div className="bg-tertiary/30 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-gray-500">
                        <User size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No profiles yet</h3>
                    <p className="text-gray-400 max-w-xs mb-6">Add a profile to start generating personalized advice and date ideas.</p>
                    <button onClick={onAddProfile} className="text-accent hover:text-white font-medium">
                        + Add your first profile
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {profiles.map(p => (
                        <div key={p.id} className="bg-secondary rounded-2xl shadow-lg overflow-hidden group relative transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-tertiary/50 cursor-pointer" onClick={() => onSelectProfile(p)}>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteProfile(p.id); }} 
                                className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-md text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:scale-110"
                                aria-label="Delete profile"
                            >
                                <Trash2 size={16} />
                            </button>
                            
                            <div className="relative h-48 overflow-hidden">
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                 <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                 <div className="absolute bottom-4 left-4 right-4 z-20">
                                     <h3 className="text-xl font-bold text-white truncate">{p.name}</h3>
                                     <p className="text-sm text-gray-300 truncate opacity-90">{p.occupation || 'No occupation'}</p>
                                 </div>
                            </div>
                            
                            <div className="p-4 bg-secondary relative">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="bg-tertiary/50 px-2 py-0.5 rounded">
                                        {p.zipCode ? '📍 Local' : '🌍 Remote'}
                                    </span>
                                    {p.notes && <span className="bg-tertiary/50 px-2 py-0.5 rounded">📝 Notes</span>}
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                    {p.description || "No description provided."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const ProfileManager: React.FC<{
  profiles: PersonProfile[];
  setProfiles: React.Dispatch<React.SetStateAction<PersonProfile[]>>;
  userZip?: string;
  onPlanDate: (profile: PersonProfile) => void;
}> = ({ profiles, setProfiles, userZip, onPlanDate }) => {
  const [selectedProfile, setSelectedProfile] = useState<PersonProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // State for the "Plan a date" modal prompt
  const [promptProfile, setPromptProfile] = useState<PersonProfile | null>(null);

  const handleSaveProfile = (profileToSave: PersonProfile) => {
    const isNew = !profileToSave.id;
    let savedProfile = profileToSave;

    if (!isNew) { // Existing profile
      setProfiles(profiles.map(p => p.id === profileToSave.id ? profileToSave : p));
    } else { // New profile
      savedProfile = { ...profileToSave, id: Date.now().toString(), avatarUrl: profileToSave.avatarUrl || `https://picsum.photos/seed/${Date.now()}/200` };
      setProfiles([...profiles, savedProfile]);
    }
    setSelectedProfile(null);
    setIsCreating(false);

    // Show prompt if it was a new profile creation
    if (isNew) {
        setPromptProfile(savedProfile);
    }
  };
  
  const handleDeleteProfile = (id: string) => {
      if (window.confirm("Are you sure you want to delete this profile?")) {
        setProfiles(profiles.filter(p => p.id !== id));
      }
  }

  // Prompt Modal
  if (promptProfile) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-secondary border border-tertiary/50 w-full max-w-md rounded-2xl shadow-2xl p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <CalendarHeart size={40} className="text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Profile Created!</h3>
                  <p className="text-gray-300 mb-8">
                      Ready to plan your first date with <span className="font-bold text-white">{promptProfile.name}</span>?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button 
                          onClick={() => setPromptProfile(null)}
                          className="px-6 py-3 rounded-xl text-gray-400 font-medium hover:bg-tertiary hover:text-white transition-colors"
                      >
                          Maybe Later
                      </button>
                      <button 
                          onClick={() => {
                              setPromptProfile(null);
                              onPlanDate(promptProfile);
                          }}
                          className="px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                          Yes, Plan a Date <ArrowRight size={16} />
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  if (selectedProfile) {
    return <ProfileDetail 
        profile={selectedProfile} 
        onBack={() => setSelectedProfile(null)} 
        onUpdateProfile={handleSaveProfile}
        userZip={userZip}
    />;
  }
  
  if (isCreating) {
      const newProfile: PersonProfile = {
          id: '', name: '', avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`, description: '', likes: '', dislikes: '', hobbies: '', occupation: '', notes: ''
      };
      return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setIsCreating(false)} className="p-2 rounded-full hover:bg-tertiary transition-colors text-gray-400">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold">Create New Profile</h2>
            </div>
            <ProfileForm profile={newProfile} onSave={handleSaveProfile} onCancel={() => setIsCreating(false)} />
        </div>
      )
  }

  return <ProfileList profiles={profiles} onSelectProfile={setSelectedProfile} onAddProfile={() => setIsCreating(true)} onDeleteProfile={handleDeleteProfile} />;
};

export default ProfileManager;
