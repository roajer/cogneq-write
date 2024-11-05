import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthStore } from '../lib/store';
import { BookProject } from '../types';
import { BookOpen, Search, Filter } from 'lucide-react';

export default function BookList() {
  const user = useAuthStore((state) => state.user);
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BookProject['status'] | 'all'>('all');

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

  const filteredProjects = projects
    .filter(project => 
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())
    )
    .filter(project => filter === 'all' || project.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Books</h1>
        <Link
          to="/books/new"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          New Book Project
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as BookProject['status'] | 'all')}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Phases</option>
            <option value="research">Research</option>
            <option value="writing">Writing</option>
            <option value="editing">Editing</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            to={`/books/${project.id}`}
            className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{project.status} Phase</p>
              </div>
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
            <div className="mt-4">
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">{project.progress}%</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No books found</h3>
          <p className="mt-2 text-gray-500">
            {projects.length === 0
              ? "You haven't created any book projects yet."
              : "No books match your search criteria."}
          </p>
          {projects.length === 0 && (
            <Link
              to="/books/new"
              className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-700"
            >
              Start your first book project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}