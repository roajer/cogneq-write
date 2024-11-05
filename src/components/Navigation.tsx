import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Layout, User, BookPlus, LogOut } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { auth } from '../lib/firebase';

export default function Navigation() {
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  const navItems = [
    { path: '/', icon: Layout, label: 'Dashboard' },
    { path: '/books', icon: BookOpen, label: 'My Books' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="w-64 bg-white min-h-screen border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-purple-600" />
          <h1 className="text-xl font-semibold text-gray-900">CogneQ Write</h1>
        </div>
      </div>

      <div className="flex-1 py-6 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
              location.pathname === item.path
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}

        <Link
          to="/books/new"
          className="flex items-center space-x-2 px-4 py-2 mx-4 mt-6 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
        >
          <BookPlus className="h-5 w-5" />
          <span>New Book Project</span>
        </Link>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 w-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </div>
    </nav>
  );
}