import type { Project } from '../types/project.types';

export interface Persona {
  id: string;
  label: string;
  keywords: string[];
}

/** Roles a visitor can say they're hiring for. Keywords are matched against
 * each project's title, description, category and technologies. */
export const personas: Persona[] = [
  {
    id: 'ml',
    label: 'ML / Data Science',
    keywords: ['machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'scikit', 'bert', 'lstm', 'transformer', 'model', 'forecast', 'predict', 'classification', 'statistic'],
  },
  {
    id: 'de',
    label: 'Data Engineering',
    keywords: ['etl', 'pipeline', 'spark', 'airflow', 'sql', 'aws', 'azure', 'snowflake', 'bigquery', 'databricks', 'kafka', 'warehouse', 'data engineering', 'power bi', 'dashboard'],
  },
  {
    id: 'agentic',
    label: 'Agentic AI & MLOps',
    keywords: ['llm', 'agent', 'mlops', 'gpt', 'langchain', 'rag', 'docker', 'kubernetes', 'ci/cd', 'mlflow', 'chatbot', 'generative', 'deployment'],
  },
  {
    id: 'fullstack',
    label: 'Full-Stack',
    keywords: ['react', 'node', 'typescript', 'javascript', 'flask', 'django', 'api', 'html', 'css', 'frontend', 'backend', 'web app', 'full stack'],
  },
];

export const getPersona = (label: string | null) => personas.find((p) => p.label === label) ?? null;

export function projectRelevance(project: Project, persona: Persona): number {
  const text = `${project.title} ${project.description} ${project.category} ${project.technologies.join(' ')}`.toLowerCase();
  return persona.keywords.reduce((score, k) => score + (text.includes(k) ? 1 : 0), 0);
}
