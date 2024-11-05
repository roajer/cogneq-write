export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface BookProject {
  id: string;
  title: string;
  description: string;
  genre: string;
  targetAudience: string;
  status: 'research' | 'writing' | 'editing' | 'marketing';
  progress: number;
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
  outline: string[];
  research: {
    marketAnalysis: string;
    competitorAnalysis: string;
    keywords: string[];
    lastSearched?: number;
    bookData?: any[];
  };
  chapters: {
    [key: string]: {
      title: string;
      content: string;
      status: 'draft' | 'review' | 'complete';
      wordCount: number;
    };
  };
  marketing: {
    targetPlatforms: string[];
    promotionalContent: string[];
    schedule: any[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  bio: string;
  writingExperience: string;
  genreFocus: string;
  theme: 'light' | 'dark';
  writingStyle: string;
  aiModelPreference: string;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
}