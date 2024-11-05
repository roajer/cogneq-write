import React from 'react';
import { BookOpen, Sparkles, PenTool, BookCheck } from 'lucide-react';
import Auth from './Auth';
import PricingPlans from './PricingPlans';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">CogneQ Write</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Transform Your Book Ideas into Reality
              <span className="block text-purple-600">with AI-Powered Guidance</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg">
              From market research to chapter writing, our AI assistant helps you craft your book with professional guidance every step of the way.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <Sparkles className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-semibold">Market Research</h3>
                <p className="text-sm text-gray-500">Data-driven insights for your book's success</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <PenTool className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-semibold">Title Creation</h3>
                <p className="text-sm text-gray-500">Captivating titles that grab attention</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <BookCheck className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-semibold">Outline Building</h3>
                <p className="text-sm text-gray-500">Structured approach to your story</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
                <h3 className="font-semibold">Chapter Writing</h3>
                <p className="text-sm text-gray-500">Detailed assistance for each section</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 lg:mt-0">
            <Auth />
          </div>
        </div>
      </div>

      <PricingPlans />
    </div>
  );
}