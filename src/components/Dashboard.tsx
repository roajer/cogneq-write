import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthStore } from '../lib/store';
import { BookProject } from '../types';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { BookOpen, TrendingUp, Edit3, Megaphone } from 'lucide-react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const projectsRef = ref(db, `users/${user.uid}/projects`);
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectList = Object.entries(data).map(([id, project]) => ({
          id,
          ...(project as any),
        }));
        setProjects(projectList);
      } else {
        setProjects([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusCount = (status: BookProject['status']) => {
    return projects.filter(project => project.status === status).length;
  };

  const progressData = {
    labels: projects.map(p => p.title),
    datasets: [{
      label: 'Book Progress',
      data: projects.map(p => p.progress),
      borderColor: 'rgb(147, 51, 234)',
      tension: 0.1
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Research Phase</p>
              <p className="text-2xl font-bold text-gray-900">{getStatusCount('research')}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Writing Phase</p>
              <p className="text-2xl font-bold text-gray-900">{getStatusCount('writing')}</p>
            </div>
            <Edit3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Editing Phase</p>
              <p className="text-2xl font-bold text-gray-900">{getStatusCount('editing')}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Marketing Phase</p>
              <p className="text-2xl font-bold text-gray-900">{getStatusCount('marketing')}</p>
            </div>
            <Megaphone className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h2>
          <div className="h-64">
            <Line data={progressData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h2>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/books/${project.id}`}
                className="block p-4 rounded-lg hover:bg-gray-50 border border-gray-100"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">{project.status} Phase</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No book projects yet.</p>
                <Link
                  to="/books/new"
                  className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center space-x-1 mt-2"
                >
                  <BookPlus className="h-4 w-4" />
                  <span>Start your first book project</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}