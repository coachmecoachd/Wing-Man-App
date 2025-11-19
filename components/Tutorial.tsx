
import React, { useState } from 'react';
import { HeartHandshake, UsersRound, MessageSquareMore, CalendarHeart, Sparkles } from 'lucide-react';

interface Slide {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const slides: Slide[] = [
    {
      title: "Your Wing Man",
      description: "Welcome! I'm here to help you navigate dating with confidence, creativity, and a little bit of AI magic.",
      icon: <HeartHandshake size={100} className="text-accent" />,
    },
    {
      title: "Remember Every Detail",
      description: "Create Profiles for the people you meet. I'll remember their likes and hobbies so you can plan better dates.",
      icon: <UsersRound size={100} className="text-blue-400" />,
    },
    {
      title: "Never Get Stuck",
      description: "Don't know what to reply? Use the Text Helper. I'll suggest charming, witty, or serious responses instantly.",
      icon: <MessageSquareMore size={100} className="text-green-400" />,
    },
    {
      title: "Plan Perfect Moments",
      description: "Use the Date Planner and Gift Lab to generate unique ideas tailored specifically to their personality.",
      icon: <CalendarHeart size={100} className="text-purple-400" />,
    },
    {
      title: "Expert Guidance",
      description: "From outfit checks to breaking language barriers, I've got the tools you need. Let's get started!",
      icon: <Sparkles size={100} className="text-yellow-400" />,
    },
  ];

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end on new touch
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/90 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-secondary border border-tertiary/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative min-h-[500px]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Skip Button */}
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={onComplete}
            className="text-gray-500 hover:text-white text-sm font-medium px-3 py-1 rounded-full hover:bg-tertiary transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-8 select-none">
            <div className="animate-bounce-slow drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                {slides[currentSlide].icon}
            </div>
            
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    {slides[currentSlide].title}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed">
                    {slides[currentSlide].description}
                </p>
            </div>
        </div>

        {/* Navigation Area */}
        <div className="p-8 pt-0">
            {/* Dots */}
            <div className="flex justify-center gap-2 mb-8">
                {slides.map((_, index) => (
                    <button 
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'w-8 bg-accent' : 'w-2 bg-gray-700 hover:bg-gray-500'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-4">
                 {currentSlide > 0 ? (
                    <button 
                        onClick={handlePrev}
                        className="text-gray-400 hover:text-white font-semibold px-4 py-2 transition-colors"
                    >
                        Back
                    </button>
                 ) : (
                     <div className="w-16"></div> // Spacer
                 )}
                
                <button 
                    onClick={handleNext}
                    className="bg-accent hover:bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-accent/20 transition-all transform active:scale-95 flex items-center gap-2"
                >
                    {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
