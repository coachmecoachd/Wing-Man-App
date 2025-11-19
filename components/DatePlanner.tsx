
import React, { useState, useEffect } from 'react';
import { PlannedDate, PersonProfile, DateOption } from '../types.ts';
import { generateStructuredDateIdeas } from '../services/geminiService.ts';
import { Trash2, Calendar, MapPin, Clock, StickyNote, Sparkles, Loader2, RefreshCw, Check, ArrowRight } from 'lucide-react';

interface DatePlannerProps {
  dates: PlannedDate[];
  setDates: React.Dispatch<React.SetStateAction<PlannedDate[]>>;
  profiles: PersonProfile[];
  initialProfile?: PersonProfile | null;
  onClearInitialProfile: () => void;
}

const DatePlanner: React.FC<DatePlannerProps> = ({ 
    dates, 
    setDates, 
    profiles, 
    initialProfile, 
    onClearInitialProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'calendar'>('plan');
  
  // Planner State
  const [step, setStep] = useState<'input' | 'results' | 'edit'>('input');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<DateOption[]>([]);
  
  // Edit State (for saving)
  const [dateToSave, setDateToSave] = useState<Partial<PlannedDate>>({});

  useEffect(() => {
      if (initialProfile) {
          setSelectedProfileId(initialProfile.id);
          if (initialProfile.zipCode) setZipCode(initialProfile.zipCode);
          setActiveTab('plan');
      }
  }, [initialProfile]);

  const handleGenerate = async () => {
      if (!zipCode || !dateTime) return;
      setIsGenerating(true);
      setStep('results');
      setGeneratedOptions([]); // clear old
      
      const profile = profiles.find(p => p.id === selectedProfileId);
      
      try {
          const options = await generateStructuredDateIdeas(zipCode, dateTime, profile);
          setGeneratedOptions(options);
      } catch (error) {
          console.error(error);
          // Fallback or error state could go here
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSelectOption = (option: DateOption) => {
      setDateToSave({
          title: option.title,
          location: option.location,
          date: dateTime,
          personId: selectedProfileId,
          notes: `${option.description}\n\nWhy: ${option.reasoning}`
      });
      setStep('edit');
  };
  
  const handleSaveDate = (finalDate: PlannedDate) => {
      setDates([...dates, finalDate]);
      setStep('input');
      setGeneratedOptions([]);
      setDateToSave({});
      onClearInitialProfile();
      setActiveTab('calendar');
  };

  const handleDeleteDate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this date?")) {
        setDates(dates.filter(d => d.id !== id));
    }
  };

  return (
    <div className="space-y-8">
        <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-white">Date Planner</h2>
            <p className="mt-2 text-lg text-gray-400">Plan the perfect outing or manage your schedule.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
            <div className="bg-secondary p-1 rounded-xl inline-flex border border-tertiary">
                <button 
                    onClick={() => setActiveTab('plan')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'plan' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    Plan a Date
                </button>
                <button 
                    onClick={() => setActiveTab('calendar')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'calendar' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    My Calendar
                </button>
            </div>
        </div>

        {activeTab === 'plan' && (
            <div className="animate-fade-in">
                {/* STEP 1: INPUT */}
                {step === 'input' && (
                    <div className="max-w-2xl mx-auto bg-secondary p-8 rounded-2xl shadow-xl border border-tertiary/50">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Sparkles className="text-accent" />
                            Create My Perfect Date
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">When?</label>
                                    <input 
                                        type="datetime-local" 
                                        value={dateTime} 
                                        onChange={e => setDateTime(e.target.value)} 
                                        className="w-full bg-tertiary border-transparent rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent text-white" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Where? (Zip Code)</label>
                                    <input 
                                        type="text" 
                                        value={zipCode} 
                                        onChange={e => setZipCode(e.target.value)} 
                                        placeholder="e.g. 90210"
                                        className="w-full bg-tertiary border-transparent rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent text-white" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Who are you going with? (Optional)</label>
                                <select 
                                    value={selectedProfileId} 
                                    onChange={e => {
                                        setSelectedProfileId(e.target.value);
                                        const p = profiles.find(prof => prof.id === e.target.value);
                                        if (p?.zipCode && !zipCode) setZipCode(p.zipCode);
                                    }}
                                    className="w-full bg-tertiary border-transparent rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent text-white"
                                >
                                    <option value="">Just me / Deciding later</option>
                                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">Selecting a profile helps AI tailor the date to their interests.</p>
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={!zipCode || !dateTime}
                                className="w-full bg-accent hover:bg-red-600 disabled:bg-gray-600 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                <Sparkles size={20} />
                                Generate Date Ideas
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: RESULTS */}
                {step === 'results' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                             <button onClick={() => setStep('input')} className="text-gray-400 hover:text-white text-sm font-medium">
                                &larr; Back to details
                            </button>
                            <h3 className="text-xl font-bold text-white">Select an Option</h3>
                        </div>

                        {isGenerating ? (
                            <div className="py-20 text-center bg-secondary/30 rounded-2xl border border-dashed border-tertiary">
                                <Loader2 size={48} className="animate-spin text-accent mx-auto mb-4" />
                                <p className="text-xl font-medium text-white">Analyzing local spots...</p>
                                <p className="text-gray-400">Finding the perfect match for your date.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {generatedOptions.map((option, idx) => (
                                    <div key={idx} className="bg-secondary rounded-2xl p-6 border border-tertiary/50 hover:border-accent transition-all hover:shadow-2xl flex flex-col relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-accent/10 transition-colors"></div>
                                        <div className="relative z-10 flex-grow">
                                            <h4 className="text-xl font-bold text-white mb-2">{option.title}</h4>
                                            <div className="flex items-center gap-2 text-accent text-sm font-bold mb-3 uppercase tracking-wide">
                                                <MapPin size={14} />
                                                {option.location}
                                            </div>
                                            <p className="text-gray-300 mb-4 text-sm leading-relaxed">{option.description}</p>
                                            <div className="bg-tertiary/30 p-3 rounded-lg text-xs text-gray-400 italic border border-tertiary/30">
                                                <span className="font-bold text-gray-300 not-italic mr-1">Why:</span>
                                                {option.reasoning}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleSelectOption(option)}
                                            className="mt-6 w-full bg-white text-primary hover:bg-gray-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            Select this Idea <ArrowRight size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isGenerating && (
                            <div className="flex justify-center mt-8">
                                <button onClick={handleGenerate} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-tertiary/50 px-4 py-2 rounded-full hover:bg-tertiary">
                                    <RefreshCw size={16} />
                                    Regenerate Options
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: EDIT & SAVE */}
                {step === 'edit' && (
                     <div className="max-w-2xl mx-auto">
                        <button onClick={() => setStep('results')} className="text-gray-400 hover:text-white text-sm font-medium mb-4 block">
                            &larr; Back to options
                        </button>
                        <div className="bg-secondary p-8 rounded-2xl shadow-xl border border-tertiary/50">
                            <h3 className="text-2xl font-bold text-white mb-6">Finalize & Save</h3>
                            <DateForm 
                                initialData={dateToSave} 
                                profiles={profiles} 
                                onSave={handleSaveDate} 
                                onCancel={() => setStep('results')}
                            />
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'calendar' && (
            <div className="animate-fade-in">
                <DateList dates={dates} profiles={profiles} onDelete={handleDeleteDate} />
            </div>
        )}
    </div>
  );
};

// --- Sub Components ---

const DateForm: React.FC<{
  initialData?: Partial<PlannedDate>;
  profiles: PersonProfile[];
  onSave: (date: PlannedDate) => void;
  onCancel: () => void;
}> = ({ initialData, profiles, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [personId, setPersonId] = useState(initialData?.personId || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !personId || !date) return;
    onSave({ 
        id: Date.now().toString(),
        title, 
        personId, 
        date, 
        location, 
        notes 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Date Title</label>
          <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent" required placeholder="e.g. Dinner & Movie" />
        </div>
        <div>
          <label htmlFor="personId" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">With</label>
          <select id="personId" value={personId} onChange={e => setPersonId(e.target.value)} className="mt-1 block w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent" required>
            <option value="" disabled>Select a profile</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Date & Time</label>
          <input type="datetime-local" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent" required />
        </div>
        <div>
          <label htmlFor="location" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Location</label>
          <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="e.g., The Cozy Cafe" />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Notes</label>
        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 block w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Reservation info, dress code, etc."></textarea>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white px-4 font-medium transition-colors">Cancel</button>
        <button type="submit" className="bg-accent text-white px-8 py-3 rounded-lg hover:bg-red-600 font-bold transition-colors shadow-md">Save to Calendar</button>
      </div>
    </form>
  );
};

const DateList: React.FC<{
    dates: PlannedDate[];
    profiles: PersonProfile[];
    onDelete: (id: string) => void;
}> = ({ dates, profiles, onDelete }) => {
    const getProfileName = (id: string) => profiles.find(p => p.id === id)?.name || 'Unknown';
  
    const upcomingDates = dates
        .filter(d => new Date(d.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
    const pastDates = dates
        .filter(d => new Date(d.date) < new Date())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const DateCard: React.FC<{ date: PlannedDate }> = ({ date }) => (
        <div className="bg-secondary p-5 rounded-xl shadow-lg flex flex-col sm:flex-row items-start gap-5 border border-tertiary/50 hover:border-accent/50 transition-colors group">
            <div className="flex-shrink-0 text-center sm:text-left bg-tertiary/30 p-3 rounded-lg min-w-[80px] flex flex-col items-center justify-center">
                <div className="text-accent text-xs uppercase font-bold">{new Date(date.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <div className="text-white text-3xl font-extrabold">{new Date(date.date).getDate()}</div>
                <div className="text-gray-400 text-xs uppercase font-medium">{new Date(date.date).toLocaleDateString(undefined, { month: 'short' })}</div>
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-xl text-white mb-1">{date.title}</h4>
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                            with <span className="text-white font-medium">{getProfileName(date.personId)}</span>
                        </p>
                    </div>
                    <button onClick={() => onDelete(date.id)} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-tertiary transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={18} />
                    </button>
                </div>
                
                <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-300 flex items-center gap-2">
                        <Clock size={14} className="text-accent" />
                        {new Date(date.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {date.location && (
                        <p className="text-sm text-gray-300 flex items-center gap-2">
                            <MapPin size={14} className="text-accent" />
                            {date.location}
                        </p>
                    )}
                </div>

                {date.notes && (
                    <div className="mt-3 text-sm bg-primary/50 p-3 rounded-lg border border-tertiary/30 flex gap-2 items-start">
                        <StickyNote size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-400 italic whitespace-pre-wrap">{date.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg text-accent font-semibold mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Upcoming
                </h3>
                {upcomingDates.length > 0 ? (
                    <div className="space-y-4">{upcomingDates.map(d => <DateCard key={d.id} date={d}/>)}</div>
                ) : (
                    <div className="text-center py-10 bg-secondary/50 rounded-xl border border-dashed border-tertiary">
                        <p className="text-gray-500">No upcoming dates scheduled.</p>
                    </div>
                )}
            </div>
            {pastDates.length > 0 && (
                <div>
                     <h3 className="text-lg text-gray-500 font-semibold mb-4">Past</h3>
                    <div className="space-y-4 opacity-75">{pastDates.map(d => <DateCard key={d.id} date={d}/>)}</div>
                </div>
            )}
        </div>
    );
}

export default DatePlanner;
