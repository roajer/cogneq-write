import React from 'react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export default function MessageList({ messages, messagesEndRef, className = '' }: MessageListProps) {
  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${className}`}>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-3xl rounded-lg px-6 py-3 ${
              message.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-200'
            }`}
          >
            <p className="text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
            <p className="text-xs mt-2 opacity-70">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}