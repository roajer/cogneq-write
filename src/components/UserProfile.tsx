import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/store';
import { Settings, Save, User } from 'lucide-react';

interface UserProfileData {
  full_name: string;
  bio: string;
  writing_experience: string;
  genre_focus: string;
  theme: string;
  writing_style: string;
  ai_model_preference: string;
  subscription_status: string;
  subscription_end_date: string | null;
}

export default function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<UserProfileData>({
    full_name: '',
    bio: '',
    writing_experience: '',
    genre_focus: '',
    theme: 'light',
    writing_style: '',
    ai_model_preference: 'gpt-4',
    subscription_status: 'free',
    subscription_end_date: null
  });

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/user/profile', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Genre Focus</label>
              <input
                type="text"
                name="genre_focus"
                value={profile.genre_focus}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Writing Experience</label>
              <select
                name="writing_experience"
                value={profile.writing_experience}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <select
                name="theme"
                value={profile.theme}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Writing Style</label>
              <select
                name="writing_style"
                value={profile.writing_style}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select style</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="academic">Academic</option>
                <option value="creative">Creative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">AI Model Preference</label>
              <select
                name="ai_model_preference"
                value={profile.ai_model_preference}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="gpt-4">GPT-4 (Recommended)</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900">Subscription Details</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <p className="text-base font-medium text-gray-900 capitalize">{profile.subscription_status}</p>
              </div>
              {profile.subscription_end_date && (
                <div>
                  <p className="text-sm text-gray-500">Renewal Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(profile.subscription_end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}