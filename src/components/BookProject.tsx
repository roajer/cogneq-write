import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Link } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuthStore } from '../lib/store';
import { BookProject as BookProjectType } from '../types';
import { BookOpen, FileText, Search, TrendingUp, Megaphone } from 'lucide-react';
import ResearchPhase from './book/ResearchPhase';
import WritingPhase from './book/WritingPhase';
import EditingPhase from './book/EditingPhase';
import MarketingPhase from './book/MarketingPhase';

export default function BookProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [project, setProject] = useState<BookProjectType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const projectRef = ref(db, `users/${user.uid}/projects/${id}`);
    const unsubscribe = onValue(projectRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProject({ id, ...data });
      } else {
        navigate('/books');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, id, navigate]);

  const updateStatus = async (status: BookProjectType['status']) => {
    if (!user || !id || !project) return;

    try {
      await update(ref(db, `users/${user.uid}/projects/${id}`), {
        status,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const phases = [
    { status: 'research', label: 'Research', icon: Search, component: ResearchPhase },
    { status: 'writing', label: 'Writing', icon: FileText, component: WritingPhase },
    { status: 'editing', label: 'Editing', icon: TrendingUp, component: EditingPhase },
    { status: 'marketing', label: 'Marketing', icon: Megaphone, component: MarketingPhase },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-500">{project.genre} · {project.targetAudience}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Last updated: {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {phases.map(({ status, label, icon: Icon }) => (
                <Link
                  key={status}
                  to={status}
                  className={`flex-1 px-4 py-4 text-center border-b-2 ${
                    project.status === status
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => updateStatus(status)}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <Routes>
              {phases.map(({ status, component: Component }) => (
                <Route
                  key={status}
                  path={status}
                  element={<Component project={project} />}
                />
              ))}
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}