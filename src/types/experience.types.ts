export interface Experience {
  id: string;
  company: string;
  role: string;
  dateRange: string;
  duration?: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  skills: string[];
  technologies?: string[];
  description: string;
  achievements: string[];
  featured?: boolean;
}

export interface Volunteering {
  id: string;
  organization: string;
  role: string;
  dateRange: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  link?: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface Organization {
  id: string;
  name: string;
  role?: string;
  description?: string;
}
