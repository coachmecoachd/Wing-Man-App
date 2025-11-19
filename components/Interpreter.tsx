
import React, { useState, useRef } from 'react';
import { translateText, generateSpeech } from '../services/geminiService.ts';
import { ArrowRightLeft, Volume2, Loader2 } from 'lucide-react';

// Audio decoding helpers from Gemini documentation
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const languageList = [
    { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
    { code: 'nl', name: 'Dutch' }, { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese (Simplified)' }, { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }, { code: 'sv', name: 'Swedish' },
];

const Interpreter: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('es');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [error, setError] = useState('');

    const audioContextRef = useRef<AudioContext | null>(null);

    const getAudioContext = () => {
        if (audioContextRef.current === null) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error("Web Audio API is not supported in this browser.");
            }
            // Modern AudioContext takes an options object, legacy webkitAudioContext does not.
            if (AudioContextClass === window.AudioContext) {
                 audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
            } else {
                 audioContextRef.current = new AudioContextClass();
            }
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    };


    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        setIsTranslating(true);
        setError('');
        setTranslatedText('');
        const sourceLangName = languageList.find(l => l.code === sourceLang)?.name || sourceLang;
        const targetLangName = languageList.find(l => l.code === targetLang)?.name || targetLang;
        try {
            const result = await translateText(inputText, sourceLangName, targetLangName);
            setTranslatedText(result);
        } catch (e) {
            setError('Translation failed. Please try again.');
        }
        setIsTranslating(false);
    };

    const handlePlayAudio = async () => {
        if (!translatedText.trim()) return;
        setIsGeneratingAudio(true);
        setError('');
        try {
            const outputAudioContext = getAudioContext();
            const base64Audio = await generateSpeech(translatedText);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();
        } catch (e) {
            setError('Failed to generate audio. Please try again.');
        }
        setIsGeneratingAudio(false);
    };
    
    const handleSwapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setInputText(translatedText);
        setTranslatedText(inputText);
    };

    return (
        <div>
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-white">Travel Interpreter</h2>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">Break language barriers on the go. Powered by Wing Man.</p>
            </div>
            <div className="bg-secondary p-6 rounded-xl shadow-lg border border-tertiary/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Input Column */}
                    <div className="flex flex-col gap-4">
                         <label htmlFor="source-lang" className="sr-only">Source Language</label>
                        <select
                            id="source-lang"
                            value={sourceLang}
                            onChange={e => setSourceLang(e.target.value)}
                            className="w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {languageList.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                        </select>
                         <label htmlFor="input-text" className="sr-only">Text to Translate</label>
                        <textarea
                            id="input-text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            rows={8}
                            className="w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Enter text to translate..."
                        />
                    </div>
                     {/* Swap Button for mobile */}
                    <div className="flex justify-center md:hidden">
                         <button
                            onClick={handleSwapLanguages}
                            className="p-3 bg-tertiary rounded-full hover:bg-accent transition-colors"
                            aria-label="Swap languages"
                        >
                            <ArrowRightLeft size={20} className="rotate-90" />
                        </button>
                    </div>
                    {/* Output Column */}
                    <div className="flex flex-col gap-4">
                         <label htmlFor="target-lang" className="sr-only">Target Language</label>
                        <select
                            id="target-lang"
                            value={targetLang}
                            onChange={e => setTargetLang(e.target.value)}
                            className="w-full bg-tertiary border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {languageList.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                        </select>
                        <div className="w-full h-full bg-primary/50 border border-tertiary/30 rounded-lg p-3 min-h-[12rem] text-gray-300 relative">
                            {isTranslating ? (
                                <div className="flex items-center justify-center h-full text-accent gap-2">
                                    <Loader2 className="animate-spin" /> Translating...
                                </div>
                            ) : translatedText ? (
                                translatedText
                            ) : (
                                <span className="text-gray-600 italic">Translation will appear here...</span>
                            )}
                            
                            {translatedText && !isTranslating && (
                                <button 
                                    onClick={handlePlayAudio}
                                    disabled={isGeneratingAudio}
                                    className="absolute bottom-3 right-3 bg-accent p-2.5 rounded-full hover:bg-red-600 disabled:bg-gray-600 transition-colors shadow-lg"
                                    aria-label="Play audio"
                                >
                                    {isGeneratingAudio 
                                        ? <Loader2 size={20} className="animate-spin text-white" />
                                        : <Volume2 size={20} className="text-white" />
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex justify-center items-center gap-6 mt-8">
                     <button
                        onClick={handleSwapLanguages}
                        className="p-3 bg-tertiary rounded-full hover:bg-accent hidden md:block transition-colors"
                        aria-label="Swap languages"
                    >
                         <ArrowRightLeft size={24} />
                    </button>
                    <button
                        onClick={handleTranslate}
                        disabled={isTranslating || !inputText.trim()}
                        className="w-full sm:w-auto bg-accent text-white px-10 py-3.5 rounded-lg hover:bg-red-600 disabled:bg-gray-600 font-bold text-lg shadow-lg transition-all transform active:scale-95"
                    >
                        {isTranslating ? 'Translating...' : 'Translate'}
                    </button>
                </div>
                {error && <p className="text-center text-red-400 mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default Interpreter;
