import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../lib/store';
import { BookProject } from '../../types';
import { Search, BookOpen, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { sendMessage } from '../../lib/api';

interface ResearchPhaseProps {
  project: BookProject;
}

interface BookData {
  title: string;
  author: string;
  description: string;
  price: string;
  bsr: string;
  publishDate: string;
  keywords: string[];
}

export default function ResearchPhase({ project }: ResearchPhaseProps) {
  const user = useAuthStore((state) => state.user);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [books, setBooks] = useState<BookData[]>([]);
  const [suggestion, setSuggestion] = useState<{
    title: string;
    description: string;
    outline: string[];
  } | null>(null);
  const [error, setError] = useState('');

  const searchBooks = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would call your backend API
      // which would then use a service like Amazon Product Advertising API
      const response = await fetch(`/api/books/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();
      setBooks(data);

      // Store research data in Firebase
      if (user && project.id) {
        await update(ref(db, `users/${user.uid}/projects/${project.id}/research`), {
          keywords: [...(project.research.keywords || []), keyword],
          lastSearched: Date.now(),
          bookData: data,
        });
      }
    } catch (err) {
      setError('Failed to fetch book data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeMarket = async () => {
    if (books.length === 0) return;
    setAnalyzing(true);
    setError('');

    try {
      const analysisPrompt = `Analyze these books in the ${project.genre} genre:
        ${books.map(book => `
          Title: ${book.title}
          Description: ${book.description}
          BSR: ${book.bsr}
          Price: ${book.price}
          Keywords: ${book.keywords.join(', ')}
        `).join('\n')}

        Based on this analysis:
        1. Suggest a unique book title
        2. Write a compelling description
        3. Create a high-level outline
        Consider the target audience: ${project.targetAudience}`;

      const response = await sendMessage(analysisPrompt);
      // Parse the LLM response and structure it
      const suggestion = parseAnalysisResponse(response);
      setSuggestion(suggestion);

    } catch (err) {
      setError('Failed to analyze market data. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const parseAnalysisResponse = (response: string) => {
    // This is a simplified parser. In production, you'd want more robust parsing
    const sections = response.split('\n\n');
    return {
      title: sections[0].replace('Title: ', ''),
      description: sections[1].replace('Description: ', ''),
      outline: sections[2].split('\n').filter(line => line.trim()),
    };
  };

  const approveSuggestion = async () => {
    if (!user || !project.id || !suggestion) return;

    try {
      await update(ref(db, `users/${user.uid}/projects/${project.id}`), {
        title: suggestion.title,
        description: suggestion.description,
        outline: suggestion.outline,
        updatedAt: Date.now(),
        progress: 25, // Update progress as research phase completes
      });
    } catch (err) {
      setError('Failed to save suggestions. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Market Research</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword to search books..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchBooks}
              disabled={loading || !keyword.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>{loading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>

          {books.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Found {books.length} books</h4>
                <button
                  onClick={analyzeMarket}
                  disabled={analyzing}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 flex items-center space-x-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>{analyzing ? 'Analyzing...' : 'Analyze Market'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {books.map((book, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium">{book.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>BSR: {book.bsr}</p>
                      <p>Price: {book.price}</p>
                      <p>Published: {book.publishDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {suggestion && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Suggested Title</h4>
              <p className="mt-1">{suggestion.title}</p>
            </div>

            <div>
              <h4 className="font-medium">Description</h4>
              <p className="mt-1">{suggestion.description}</p>
            </div>

            <div>
              <h4 className="font-medium">Outline</h4>
              <ul className="mt-2 space-y-2">
                {suggestion.outline.map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-purple-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSuggestion(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <XCircle className="h-5 w-5" />
                <span>Reject</span>
              </button>
              <button
                onClick={approveSuggestion}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}