import React, { useState, useRef, useEffect } from 'react';
import { Send, Maximize2, Minimize2 } from 'lucide-react';
import { useChatStore } from '../lib/store';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../lib/store';
import { sendMessage } from '../lib/api';
import MessageList from './MessageList';
import Sidebar from './Sidebar';

export default function Chat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, addMessage, bookTitle, outline, currentSection } = useChatStore();
  const setUser = useAuthStore((state) => state.setUser);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    try {
      const response = await sendMessage(userMessage);
      addMessage({
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  return (
    <div className={`flex h-screen bg-gray-50 transition-all duration-300 ${isExpanded ? 'fixed inset-0 z-50' : ''}`}>
      <Sidebar
        bookTitle={bookTitle}
        outline={outline}
        currentSection={currentSection}
        onLogout={handleLogout}
        className={isExpanded ? 'w-72' : 'w-64'}
      />

      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
          >
            {isExpanded ? (
              <Minimize2 className="h-5 w-5 text-gray-600" />
            ) : (
              <Maximize2 className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        <MessageList 
          messages={messages} 
          messagesEndRef={messagesEndRef}
          className={isExpanded ? 'max-w-4xl mx-auto w-full' : ''}
        />

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
          <div className={`flex space-x-4 ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? 'Please wait...' : 'Type your message...'}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 text-white rounded-lg px-6 py-3 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}