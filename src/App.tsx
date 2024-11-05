import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import UserProfile from './components/UserProfile';
import BookProject from './components/BookProject';
import Navigation from './components/Navigation';
import BookList from './components/BookList';
import NewBook from './components/NewBook';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user ? (
          <div className="flex">
            <Navigation />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/books" element={<BookList />} />
                <Route path="/books/new" element={<NewBook />} />
                <Route path="/books/:id/*" element={<BookProject />} />
              </Routes>
            </div>
          </div>
        ) : (
          <LandingPage />
        )}
      </div>
    </Router>
  );
}

export default App;