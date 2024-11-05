import React, { useState, useEffect } from 'react';
import { ref, update, get } from 'firebase/database';
import { functions, db } from '../../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { useAuthStore } from '../../lib/store';
import { BookProject } from '../../types';
import { FileText, Plus, Save, Edit3, Check, X } from 'lucide-react';

interface WritingPhaseProps {
  project: BookProject;
}

interface Chapter {
  title: string;
  content: string;
  status: 'draft' | 'review' | 'complete';
  wordCount: number;
}

export default function WritingPhase({ project }: WritingPhaseProps) {
  const user = useAuthStore((state) => state.user);
  const [chapters, setChapters] = useState<Record<string, Chapter>>(project.chapters || {});
  const [currentChapter, setCurrentChapter] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateChapterContent = httpsCallable(functions, 'generateChapterContent');

  const addNewChapter = () => {
    const chapterNumber = Object.keys(chapters).length + 1;
    const newChapterId = `chapter-${chapterNumber}`;
    setChapters(prev => ({
      ...prev,
      [newChapterId]: {
        title: `Chapter ${chapterNumber}`,
        content: '',
        status: 'draft',
        wordCount: 0
      }
    }));
    saveChapters({
      ...chapters,
      [newChapterId]: {
        title: `Chapter ${chapterNumber}`,
        content: '',
        status: 'draft',
        wordCount: 0
      }
    });
  };

  const saveChapters = async (updatedChapters: Record<string, Chapter>) => {
    if (!user || !project.id) return;

    try {
      await update(ref(db, `users/${user.uid}/projects/${project.id}`), {
        chapters: updatedChapters,
        updatedAt: Date.now()
      });
    } catch (err) {
      setError('Failed to save chapters');
    }
  };

  const generateContent = async (chapterId: string) => {
    if (!user || !project.id) return;
    setLoading(true);
    setError('');

    try {
      const chapter = chapters[chapterId];
      const result = await generateChapterContent({
        chapterTitle: chapter.title,
        outline: project.outline,
        genre: project.genre,
        targetAudience: project.targetAudience
      });

      const updatedChapters = {
        ...chapters,
        [chapterId]: {
          ...chapter,
          content: result.data.content,
          wordCount: result.data.content.split(/\s+/).length
        }
      };

      setChapters(updatedChapters);
      await saveChapters(updatedChapters);
    } catch (err) {
      setError('Failed to generate chapter content');
    } finally {
      setLoading(false);
    }
  };

  const updateChapterStatus = async (chapterId: string, status: Chapter['status']) => {
    const updatedChapters = {
      ...chapters,
      [chapterId]: {
        ...chapters[chapterId],
        status
      }
    };
    setChapters(updatedChapters);
    await saveChapters(updatedChapters);
  };

  const startEditingTitle = (chapterId: string) => {
    setEditingTitle(chapterId);
    setNewTitle(chapters[chapterId].title);
  };

  const saveTitle = async (chapterId: string) => {
    if (!newTitle.trim()) return;

    const updatedChapters = {
      ...chapters,
      [chapterId]: {
        ...chapters[chapterId],
        title: newTitle.trim()
      }
    };
    setChapters(updatedChapters);
    await saveChapters(updatedChapters);
    setEditingTitle(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Writing Phase</h2>
        <button
          onClick={addNewChapter}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Chapter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chapter List */}
        <div className="space-y-4">
          {Object.entries(chapters).map(([chapterId, chapter]) => (
            <div
              key={chapterId}
              className={`p-4 border rounded-lg ${
                currentChapter === chapterId ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                {editingTitle === chapterId ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                      autoFocus
                    />
                    <button
                      onClick={() => saveTitle(chapterId)}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingTitle(null)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{chapter.title}</h3>
                    <button
                      onClick={() => startEditingTitle(chapterId)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <span className={`text-sm px-2 py-1 rounded ${
                  chapter.status === 'complete' ? 'bg-green-100 text-green-800' :
                  chapter.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {chapter.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {chapter.wordCount} words
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentChapter(chapterId)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => generateContent(chapterId)}
                    disabled={loading}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chapter Content */}
        {currentChapter && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{chapters[currentChapter].title}</h3>
              <div className="space-x-2">
                <button
                  onClick={() => updateChapterStatus(currentChapter, 'review')}
                  className="px-3 py-1 text-sm border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50"
                >
                  Send to Review
                </button>
                <button
                  onClick={() => updateChapterStatus(currentChapter, 'complete')}
                  className="px-3 py-1 text-sm border border-green-300 text-green-700 rounded hover:bg-green-50"
                >
                  Mark Complete
                </button>
              </div>
            </div>

            <textarea
              value={chapters[currentChapter].content}
              onChange={(e) => {
                const updatedChapters = {
                  ...chapters,
                  [currentChapter]: {
                    ...chapters[currentChapter],
                    content: e.target.value,
                    wordCount: e.target.value.split(/\s+/).length
                  }
                };
                setChapters(updatedChapters);
              }}
              onBlur={() => saveChapters(chapters)}
              className="w-full h-[calc(100vh-300px)] p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Start writing your chapter content..."
            />
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