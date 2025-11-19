import React from 'react';
import { View } from '../types.ts';
import { 
  MessageSquareMore, 
  CalendarHeart, 
  UsersRound, 
  Sparkles, 
  Gift, 
  Languages 
} from 'lucide-react';

interface DashboardProps {
  setView: (view: View) => void;
}

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    className="bg-secondary/60 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-accent/20 hover:-translate-y-1 transform transition-all duration-300 cursor-pointer border border-tertiary group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:bg-accent/10 transition-colors"></div>
    
    <div className="relative z-10">
        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-tertiary/50 text-accent mb-5 group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-inner border border-white/5">
        {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const features = [
    {
      title: 'Text Helper',
      description: 'Stuck on what to reply? Get AI-powered suggestions tailored to your conversation vibe.',
      icon: <MessageSquareMore size={28} />,
      view: 'texter' as View,
    },
    {
      title: 'Date Planner',
      description: 'Generate unique date ideas based on personality profiles and save them to your calendar.',
      icon: <CalendarHeart size={28} />,
      view: 'planner' as View,
    },
    {
      title: 'Manage Profiles',
      description: 'Create detailed profiles for people you\'re interested in to get personalized advice.',
      icon: <UsersRound size={28} />,
      view: 'profiles' as View,
    },
    {
      title: 'Dating Advice',
      description: 'Get expert advice on what to wear, what to say, and how to act on any type of date.',
      icon: <Sparkles size={28} />,
      view: 'advice' as View,
    },
    {
      title: 'Gift Lab',
      description: 'Get inspired with personalized gift ideas and generate custom designs for them.',
      icon: <Gift size={28} />,
      view: 'gifts' as View,
    },
    {
      title: 'Interpreter',
      description: 'Speak any language. Translate text and play it back with natural-sounding audio.',
      icon: <Languages size={28} />,
      view: 'interpreter' as View,
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-white sm:text-5xl tracking-tight mb-4">
          Your Personal <span className="text-accent">Wing Man</span>
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
          Like having your best friend in your pocket. Intelligent tools to help you date with confidence.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
           <div key={feature.view} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
             <FeatureCard {...feature} onClick={() => setView(feature.view)} />
           </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;