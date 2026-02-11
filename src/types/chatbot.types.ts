export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotContext {
  about: string;
  experience: {
    current: {
      role: string;
      company: string;
      duration: string;
      highlights: string[];
      technologies: string[];
    };
  };
  projects: Array<{
    name: string;
    summary: string;
    technologies: string[];
    keywords: string[];
  }>;
  skills: {
    expertise: string[];
    frameworks: string[];
    cloud: string[];
  };
  education: string;
}
