export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  date: string;
  dateRange: string;
  githubUrl: string;
  demoUrl?: string;
  featured: boolean;
  imageUrl: string;
}

export interface GitHubStats {
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}