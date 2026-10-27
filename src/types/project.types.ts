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
  /** Optional short case-study bullets (how it works / what makes it robust), shown in the project modal. */
  highlights?: string[];
  featured: boolean;
  imageUrl: string;
}

export interface GitHubStats {
  stars: number;
  forks: number;
  language: string;
  updatedAt: string;
}