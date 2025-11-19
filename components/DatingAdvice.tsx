
import React, { useState } from 'react';
import { getDatingAdvice } from '../services/geminiService.ts';
import { DatingAdviceResponse } from '../types.ts';
import { CheckCircle2, XCircle, Shirt, MessageCircle, Smile, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DatingAdvice: React.FC = () => {
    const [dateType, setDateType] = useState('First Date');
    const [question, setQuestion] = useState('');
    const [advice, setAdvice] = useState<DatingAdviceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const dateOptions = [
        'First Date',
        'Casual Coffee',
        'Formal Dinner',
        'Outdoor Activity (e.g., hiking, picnic)',
        'Movie Night',
        'Concert / Live Music',
        'Creative/Artsy (e.g., museum, pottery class)',
        'Home-cooked Meal',
    ];

    const handleGetAdvice = async () => {
        if (!dateType) return;
        setIsLoading(true);
        setAdvice(null);
        setError('');
        try {
            const result = await getDatingAdvice(dateType, question || "Give me some general tips.");
            setAdvice(result);
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const AdviceSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
        <div className="bg-primary/50 border border-tertiary/30 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3 border-b border-tertiary/30 pb-2">
                <span className="text-accent">{icon}</span>
                <h3 className="font-bold text-lg text-white">{title}</h3>
            </div>
            {children}
        </div>
    );

    return (
        <div>
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-white">Dating Advice</h2>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">Your best friend in your pocket, ready to help you navigate any dating scenario.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="bg-secondary p-6 rounded-xl shadow-lg space-y-6 self-start border border-tertiary/50">
                    <div>
                        <label htmlFor="date-type" className="block text-sm font-medium text-gray-400">1. What's the occasion?</label>
                        <select
                            id="date-type"
                            value={dateType}
                            onChange={(e) => setDateType(e.target.value)}
                            className="mt-1 block w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {dateOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="question" className="block text-sm font-medium text-gray-400">2. Have a specific question? (Optional)</label>
                        <textarea
                            id="question"
                            rows={3}
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            className="mt-1 block w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="e.g., What's a good way to bring up a second date?"
                        />
                    </div>
                    <button
                        onClick={handleGetAdvice}
                        disabled={isLoading}
                        className="w-full bg-accent text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-600 font-bold transition-colors shadow-md"
                    >
                        {isLoading ? 'Getting Advice...' : '3. Ask Wing Man'}
                    </button>
                </div>

                {/* Advice Display */}
                <div className="bg-secondary p-6 rounded-xl shadow-lg min-h-[28rem] flex flex-col border border-tertiary/50">
                    {isLoading ? (
                        <div className="flex-grow flex justify-center items-center">
                             <Loader2 size={48} className="animate-spin text-accent" />
                        </div>
                    ) : error ? (
                         <div className="flex-grow flex flex-col justify-center items-center text-center">
                            <XCircle size={48} className="text-red-500/50 mb-4" />
                            <p className="text-red-400">{error}</p>
                        </div>
                    ): advice ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="text-center bg-tertiary/50 border border-accent/20 p-4 rounded-xl mb-6">
                                <p className="text-accent text-xs uppercase tracking-widest font-bold mb-1">Key Vibe</p>
                                <p className="text-2xl font-semibold text-white italic">"{advice.keyVibe}"</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <AdviceSection title="Do's" icon={<CheckCircle2 size={20} />}>
                                    <ul className="list-none space-y-2 text-gray-300 text-sm">
                                        {advice.dos.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-0.5"><CheckCircle2 size={14} /></span>{item}</li>)}
                                    </ul>
                                </AdviceSection>
                                <AdviceSection title="Don'ts" icon={<XCircle size={20} />}>
                                     <ul className="list-none space-y-2 text-gray-300 text-sm">
                                        {advice.donts.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-red-500 mt-0.5"><XCircle size={14} /></span>{item}</li>)}
                                    </ul>
                                </AdviceSection>
                            </div>
                            
                            <AdviceSection title="Outfit Suggestion" icon={<Shirt size={20} />}>
                                <p className="text-gray-300 text-sm font-semibold">{advice.outfitSuggestion.description}</p>
                                <p className="text-gray-400 text-xs italic mt-1">{advice.outfitSuggestion.reasoning}</p>
                            </AdviceSection>

                            <AdviceSection title="Conversation Starters" icon={<MessageCircle size={20} />}>
                                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm marker:text-accent">
                                    {advice.conversationStarters.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </AdviceSection>

                            {advice.icebreakerJoke && (
                                 <AdviceSection title="Icebreaker" icon={<Smile size={20} />}>
                                    <p className="text-gray-300 text-sm italic">"{advice.icebreakerJoke}"</p>
                                </AdviceSection>
                            )}

                            {question && advice.questionAnswer && (
                                 <AdviceSection title="Your Question" icon={<HelpCircle size={20} />}>
                                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                                        <ReactMarkdown>{advice.questionAnswer}</ReactMarkdown>
                                    </div>
                                </AdviceSection>
                            )}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col justify-center items-center text-center p-8">
                            <div className="bg-tertiary/30 p-6 rounded-full mb-4">
                                <Sparkles size={48} className="text-gray-500" />
                            </div>
                            <p className="text-gray-500 max-w-xs">Select a date type and ask a question to get personalized dating advice from your Wing Man.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatingAdvice;
