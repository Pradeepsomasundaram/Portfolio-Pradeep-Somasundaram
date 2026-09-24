import projectsData from '../data/projects.json';
import experienceData from '../data/experience.json';
import skillsData from '../data/skills.json';
import certificationsData from '../data/certifications.json';
import educationData from '../data/education.json';
import { loadTransformers, progressTracker } from './transformers';

export interface SemanticDoc {
  kind: 'project' | 'experience' | 'skills' | 'certifications' | 'education';
  /** Project id, or the section id to scroll to. */
  target: string;
  title: string;
  subtitle: string;
  text: string;
}

const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
export const SEMANTIC_FLAG = 'semantic-search-enabled';

const docs: SemanticDoc[] = [
  ...projectsData.map((p): SemanticDoc => ({
    kind: 'project',
    target: p.id,
    title: p.title,
    subtitle: `Project · ${p.category}`,
    text: `${p.title}. ${p.description} Technologies: ${p.technologies.join(', ')}`,
  })),
  ...experienceData.map((e): SemanticDoc => ({
    kind: 'experience',
    target: 'experience',
    title: `${e.role} — ${e.company}`,
    subtitle: `Experience · ${e.dateRange}`,
    text: `${e.role} at ${e.company}. ${e.achievements.join(' ')} Skills: ${e.skills.join(', ')}`,
  })),
  ...Object.entries(skillsData).map(([group, items]): SemanticDoc => ({
    kind: 'skills',
    target: 'skills',
    title: group,
    subtitle: 'Skills',
    text: `${group}: ${(items as string[]).join(', ')}`,
  })),
  ...certificationsData.map((c): SemanticDoc => ({
    kind: 'certifications',
    target: 'certifications',
    title: c.name,
    subtitle: `Certification · ${c.issuer}`,
    text: `${c.name} from ${c.issuer}. ${c.description}`,
  })),
  ...educationData.map((e): SemanticDoc => ({
    kind: 'education',
    target: 'education',
    title: `${e.degree}${e.field ? `, ${e.field}` : ''}`,
    subtitle: `Education · ${e.institution}`,
    text: `${e.degree} ${e.field ?? ''} at ${e.institution}. ${e.description ?? ''}`,
  })),
];

type Embed = (text: string) => Promise<Float32Array>;
let embedder: Embed | null = null;
let vectors: Float32Array[] | null = null;
let loading: Promise<void> | null = null;

/** Downloads the ~23 MB embedding model (cached by the browser) and indexes the
 * portfolio content. Everything runs on-device; queries never leave the page. */
export function enableSemanticSearch(onProgress: (percent: number) => void): Promise<void> {
  loading ??= (async () => {
    const { pipeline } = await loadTransformers();
    const extractor = await pipeline('feature-extraction', MODEL_ID, {
      progress_callback: progressTracker(onProgress),
    });
    embedder = async (text) => {
      const out = await extractor(text, { pooling: 'mean', normalize: true });
      return Float32Array.from(out.data);
    };
    vectors = [];
    for (const d of docs) vectors.push(await embedder(d.text));
  })().catch((err) => {
    loading = null;
    throw err;
  });
  return loading;
}

export const semanticReady = () => vectors !== null;

export async function semanticSearch(query: string, limit = 4): Promise<(SemanticDoc & { score: number })[]> {
  if (!embedder || !vectors) return [];
  const q = await embedder(query);
  return vectors
    .map((v, i) => {
      let dot = 0;
      for (let k = 0; k < q.length; k++) dot += q[k] * v[k];
      return { ...docs[i], score: dot };
    })
    .filter((r) => r.score > 0.28)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
