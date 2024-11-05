import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthStore } from '../lib/store';
import { BookProject } from '../types';
import { BookOpen } from 'lucide-react';

const genres = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Thriller',
  'Horror',
  'Biography',
  'Self-Help',
  'Business',
  'Other'
];

const audiences = [
  'Children',
  'Young Adult',
  'Adult',
  'Professional',
  'Academic',
  'General'
];

export default function NewBook() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    targetAudience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const newProject: Omit<BookProject, 'id'> = {
        ...formData,
        status: 'research',
        progress: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        outline: [],
        research: {
          marketAnalysis: '',
          competitorAnalysis: '',
          keywords: [],
        },
        chapters: {},
        marketing: {
          targetPlatforms: [],
          promotionalContent: [],
          schedule: [],
        },
      };

      const projectRef = ref(db, `users/${user.uid}/projects`);
      const newRef = await push(projectRef, newProject);
      navigate(`/books/${newRef.key}`);
    } catch (err) {
      setError('Failed to create book project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <BookOpen className="h-8 w-8 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900">New Book Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Book Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              placeholder="Enter your book title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              placeholder="Write a brief description of your book"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <select
                id="genre"
                name="genre"
                required
                value={formData.genre}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select a genre</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <select
                id="targetAudience"
                name="targetAudience"
                required
                value={formData.targetAudience}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select target audience</option>
                {audiences.map(audience => (
                  <option key={audience} value={audience}>{audience}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/books')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}