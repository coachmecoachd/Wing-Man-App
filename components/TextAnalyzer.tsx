
import React, { useState } from 'react';
import { Message } from '../types.ts';
import { getReplySuggestion } from '../services/geminiService.ts';
import ReactMarkdown from 'react-markdown';

const TextAnalyzer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sender, setSender] = useState<'them' | 'me'>('them');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = () => {
    if (newMessage.trim() === '') return;
    setMessages([...messages, { id: Date.now(), sender, text: newMessage }]);
    setNewMessage('');
  };

  const handleGetSuggestion = async () => {
    if (messages.length === 0) return;
    setIsLoading(true);
    setSuggestion('');
    const result = await getReplySuggestion(messages);
    setSuggestion(result);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Text Helper</h2>
        <div className="bg-secondary p-4 rounded-lg shadow-lg space-y-4">
          <div className="h-96 overflow-y-auto p-4 bg-primary rounded-md flex flex-col gap-3">
            {messages.length === 0 && <p className="text-center text-gray-500">Add messages to start the conversation.</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.sender === 'me' ? 'bg-accent text-white' : 'bg-tertiary text-gray-200'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sender}
              onChange={(e) => setSender(e.target.value as 'them' | 'me')}
              className="bg-tertiary border border-tertiary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="them">Them</option>
              <option value="me">Me</option>
            </select>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type message..."
              className="flex-grow bg-tertiary border border-tertiary rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button onClick={addMessage} className="bg-tertiary text-white p-2 rounded-md hover:bg-opacity-80">Add</button>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => { setMessages([]); setSuggestion(''); }} className="text-sm text-gray-400 hover:text-white">Clear</button>
            <button onClick={handleGetSuggestion} disabled={isLoading || messages.length === 0} className="bg-accent text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-500">
              {isLoading ? 'Thinking...' : 'Get Advice'}
            </button>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-4">AI Suggestion</h2>
        <div className="bg-secondary p-4 rounded-lg shadow-lg min-h-[28rem]">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <p>Generating suggestions...</p>
                </div>
            ) : suggestion ? (
                <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-accent prose-strong:text-white">
                  <ReactMarkdown>{suggestion}</ReactMarkdown>
                </div>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500 text-center">Your AI-generated reply suggestions will appear here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TextAnalyzer;
