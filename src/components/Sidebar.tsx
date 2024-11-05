import React from 'react';
import { BookOpen, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  bookTitle: string;
  outline: string[];
  currentSection: string;
  onLogout: () => void;
  className?: string;
}

export default function Sidebar({ bookTitle, outline, currentSection, onLogout, className = '' }: SidebarProps) {
  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-semibold text-gray-900">CogneQ Write</h1>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {bookTitle && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Book Title</h2>
              <p className="mt-2 text-sm text-gray-900 font-medium">{bookTitle}</p>
            </div>
          )}
          
          {outline.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Outline</h2>
              <ul className="mt-2 space-y-2">
                {outline.map((item, index) => (
                  <li key={index} className="text-sm text-gray-900 py-1 px-2 rounded hover:bg-gray-50">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {currentSection && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Section</h2>
              <p className="mt-2 text-sm text-gray-900 bg-purple-50 p-2 rounded">{currentSection}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/profile"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 w-full px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 w-full px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}