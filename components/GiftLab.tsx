
import React, { useState } from 'react';
import { PersonProfile } from '../types.ts';
import { generateGiftIdeas, generateGiftImage } from '../services/geminiService.ts';
import ReactMarkdown from 'react-markdown';

const GiftLab: React.FC<{ profiles: PersonProfile[]; userZip?: string }> = ({ profiles, userZip }) => {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [ideas, setIdeas] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerateIdeas = async () => {
    if (!selectedProfileId) return;
    const profile = profiles.find(p => p.id === selectedProfileId);
    if (!profile) return;
    
    setIsGeneratingIdeas(true);
    setIdeas('');
    setGeneratedImage('');
    setImagePrompt('');
    
    try {
        const result = await generateGiftIdeas(profile, userZip);
        setIdeas(result);
    } catch (error) {
        console.error(error);
        setIdeas('Failed to generate ideas. Please try again.');
    }
    setIsGeneratingIdeas(false);
  };
  
  const handleGenerateImage = async () => {
      if (!imagePrompt) return;
      setIsGeneratingImage(true);
      setGeneratedImage('');
      try {
          const imageUrl = await generateGiftImage(imagePrompt);
          setGeneratedImage(imageUrl);
      } catch (error) {
          console.error(error);
          alert('Failed to generate image. Please try again.');
      }
      setIsGeneratingImage(false);
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-white">Gift Lab</h2>
        <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">Generate thoughtful gift ideas and custom designs.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls and Ideas */}
        <div className="bg-secondary p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <label htmlFor="profile-select" className="block text-sm font-medium text-gray-400">1. Select a Profile</label>
            <select
              id="profile-select"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="mt-1 block w-full bg-tertiary border-tertiary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="" disabled>Choose someone</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button
            onClick={handleGenerateIdeas}
            disabled={!selectedProfileId || isGeneratingIdeas}
            className="w-full bg-accent text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-500 font-bold transition-colors shadow-lg"
          >
            {isGeneratingIdeas ? 'Generating Ideas...' : '2. Generate Gift Ideas'}
          </button>
          
          {isGeneratingIdeas && <div className="text-center py-4 animate-pulse text-gray-400">Brainstorming...</div>}
          {ideas && (
            <div className="prose prose-invert max-w-none bg-primary p-4 rounded-md prose-p:text-gray-300 prose-headings:text-accent prose-strong:text-white">
              <ReactMarkdown>{ideas}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Image Generation */}
        <div className="bg-secondary p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-400">3. Enter Image Prompt</label>
            <textarea
              id="image-prompt"
              rows={3}
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
              className="mt-1 block w-full bg-tertiary border-tertiary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Copy a prompt from the generated ideas or write your own..."
            />
          </div>
          <button
            onClick={handleGenerateImage}
            disabled={!imagePrompt || isGeneratingImage}
            className="w-full bg-accent text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-500 font-bold transition-colors shadow-lg"
          >
            {isGeneratingImage ? 'Creating Design...' : '4. Generate Print Design'}
          </button>

          <div className="aspect-square bg-primary rounded-md flex items-center justify-center overflow-hidden">
            {isGeneratingImage ? (
              <p className="animate-pulse text-gray-400">Generating image...</p>
            ) : generatedImage ? (
              <img src={generatedImage} alt="Generated gift design" className="object-contain w-full h-full" />
            ) : (
              <p className="text-gray-500 text-center p-4">Your generated design will appear here.</p>
            )}
          </div>
          {generatedImage && (
            <div className="text-center text-sm text-gray-400">
                <p>Use this design with your favorite print-on-demand service!</p>
                <a href="https://www.google.com/search?q=print+on+demand+services" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Find a service</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftLab;
