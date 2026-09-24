import type { TraceEntry } from '../lib/agentClient';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Tools the live agent called to produce this message (absent for offline answers). */
  tools?: string[];
  /** Job description this answer was about, enabling a tailored-resume download. */
  resumeJd?: string;
  /** Agent internals for the "under the hood" panel. */
  trace?: TraceEntry[];
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
