import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../lib/store';
import { BookProject } from '../../types';
import { Edit3, Check, AlertTriangle, MessageSquare } from 'lucide-react';

interface EditingPhaseProps {
  project: BookProject;
}

interface EditingSuggestion {
  chapterId: string;
  position: number;
  type: 'grammar' | 'style' | 'content';
  suggestion: string;
  resolved: boolean;
}

export default function EditingPhase({ project }: EditingPhaseProps) {
  const user = useAuthStore((state) => state.user);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EditingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeSuggestions = async (chapterId: string) => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would call your LLM API
      // For now, we'll add some sample suggestions
      const newSuggestions: EditingSuggestion[] = [
        {
          chapterId,
          position: 0,
          type: 'grammar',
          suggestion: 'Consider revising this sentence for clarity.',
          resolved: false,
        },
        {
          chapterId,
          position: 100,
          type: 'style',
          suggestion: 'This paragraph could be more engaging.',
          resolved: false,
        },
      ];

      setSuggestions(prev => [...prev, ...newSuggestions]);
    } catch (err) {
      setError('Failed to analyze chapter');
    } finally {
      setLoading(false);
    }
  };

  const markSuggestionResolved = async (index: number) => {
    const updatedSuggestions = [...suggestions];
    updatedSuggestions[index].resolved = true;
    setSuggestions(updatedSuggestions);

    // Update progress in Firebase
    if (user && project.id) {
      const progress = Math.min(
        100,
        Math.round(
          (updatedSuggestions.filter(s => s.resolved).length / updatedSuggestions.length) * 100
        )
      );

      await update(ref(db, `users/${user.uid}/projects/${project.id}`), {
        progress,
        updatedAt: Date.now(),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Editing Phase</h2>
        <div className="text-sm text-gray-500">
          {suggestions.filter(s => s.resolved).length} / {suggestions.length} suggestions resolved
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chapter List */}
        <div className="space-y-4">
          {Object.entries(project.chapters || {}).map(([chapterId, chapter]) => (
            <div
              key={chapterId}
              className={`p-4 border rounded-lg ${
                selectedChapter === chapterId ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{chapter.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {suggestions.filter(s => s.chapterId === chapterId && s.resolved).length} /
                    {suggestions.filter(s => s.chapterId === chapterId).length} resolved
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {chapter.wordCount} words
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedChapter(chapterId)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => analyzeSuggestions(chapterId)}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Editing Area */}
        {selectedChapter && project.chapters[selectedChapter] && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{project.chapters[selectedChapter].title}</h3>
              <div className="space-x-2">
                <button
                  onClick={() => analyzeSuggestions(selectedChapter)}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
                >
                  Analyze Chapter
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-white">
              <div className="prose max-w-none">
                {project.chapters[selectedChapter].content}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Editing Suggestions</h4>
              {suggestions
                .filter(s => s.chapterId === selectedChapter)
                .map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      suggestion.resolved ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {suggestion.type === 'grammar' ? (
                          <Edit3 className="h-5 w-5 text-blue-500 mt-1" />
                        ) : suggestion.type === 'style' ? (
                          <MessageSquare className="h-5 w-5 text-purple-500 mt-1" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                        )}
                        <div>
                          <p className="font-medium capitalize">{suggestion.type} Suggestion</p>
                          <p className="text-gray-600 mt-1">{suggestion.suggestion}</p>
                        </div>
                      </div>
                      {!suggestion.resolved && (
                        <button
                          onClick={() => markSuggestionResolved(index)}
                          className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              {suggestions.filter(s => s.chapterId === selectedChapter).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No suggestions yet. Click "Analyze Chapter" to get started.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}