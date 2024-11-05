import React, { useState } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../lib/store';
import { BookProject } from '../../types';
import { 
  Megaphone, 
  Globe, 
  Twitter, 
  Instagram, 
  Facebook,
  Calendar,
  Plus,
  Save,
  Trash2
} from 'lucide-react';

interface MarketingPhaseProps {
  project: BookProject;
}

interface MarketingTask {
  id: string;
  platform: string;
  content: string;
  scheduledDate: string;
  status: 'pending' | 'published';
}

export default function MarketingPhase({ project }: MarketingPhaseProps) {
  const user = useAuthStore((state) => state.user);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [tasks, setTasks] = useState<MarketingTask[]>(project.marketing?.schedule || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    { id: 'website', name: 'Website', icon: Globe },
    { id: 'twitter', name: 'Twitter', icon: Twitter },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
  ];

  const generateContent = async (platform: string) => {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, this would call your LLM API
      // For now, we'll return sample content
      const sampleContent = `Check out "${project.title}" - A compelling ${project.genre} book that will take you on an unforgettable journey. #books #reading #${project.genre.toLowerCase()}`;
      setContent(sampleContent);
    } catch (err) {
      setError('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const addMarketingTask = async () => {
    if (!selectedPlatform || !content || !scheduledDate) return;

    const newTask: MarketingTask = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      content,
      scheduledDate,
      status: 'pending'
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);

    // Update in Firebase
    if (user && project.id) {
      try {
        await update(ref(db, `users/${user.uid}/projects/${project.id}/marketing`), {
          schedule: updatedTasks,
          updatedAt: Date.now()
        });

        // Reset form
        setSelectedPlatform('');
        setContent('');
        setScheduledDate('');
      } catch (err) {
        setError('Failed to save marketing task');
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);

    if (user && project.id) {
      try {
        await update(ref(db, `users/${user.uid}/projects/${project.id}/marketing`), {
          schedule: updatedTasks,
          updatedAt: Date.now()
        });
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const markAsPublished = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status: 'published' } : task
    );
    setTasks(updatedTasks);

    if (user && project.id) {
      try {
        await update(ref(db, `users/${user.uid}/projects/${project.id}/marketing`), {
          schedule: updatedTasks,
          updatedAt: Date.now()
        });
      } catch (err) {
        setError('Failed to update task status');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Marketing Phase</h2>
        <div className="text-sm text-gray-500">
          {tasks.filter(t => t.status === 'published').length} / {tasks.length} tasks completed
        </div>
      </div>

      {/* Content Generator */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Create Marketing Content</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select platform</option>
              {platforms.map(platform => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your marketing content..."
              />
              <button
                onClick={() => generateContent(selectedPlatform)}
                disabled={!selectedPlatform || loading}
                className="absolute top-2 right-2 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-300"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={addMarketingTask}
            disabled={!selectedPlatform || !content || !scheduledDate}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add to Schedule</span>
          </button>
        </div>
      </div>

      {/* Marketing Schedule */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Marketing Schedule</h3>
        
        <div className="space-y-4">
          {tasks.map(task => {
            const Platform = platforms.find(p => p.id === task.platform)?.icon || Globe;
            
            return (
              <div
                key={task.id}
                className={`p-4 border rounded-lg ${
                  task.status === 'published' ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Platform className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <p className="font-medium capitalize">{task.platform}</p>
                      <p className="text-gray-600 mt-1">{task.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Scheduled for: {new Date(task.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {task.status !== 'published' && (
                      <button
                        onClick={() => markAsPublished(task.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No marketing tasks scheduled yet.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}