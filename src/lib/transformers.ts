// transformers.js is loaded on demand from a CDN so its multi-MB runtime never
// touches the main bundle; models download only when a visitor opts in.
const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';

type ProgressEvent = { status: string; file?: string; progress?: number };
type Pipeline = (input: string, options?: Record<string, unknown>) => Promise<{ data: ArrayLike<number> } & Record<string, unknown>>;

interface Transformers {
  pipeline: (
    task: string,
    model: string,
    options?: { progress_callback?: (p: ProgressEvent) => void }
  ) => Promise<Pipeline>;
}

let cached: Promise<Transformers> | null = null;

export function loadTransformers(): Promise<Transformers> {
  cached ??= import(/* @vite-ignore */ TRANSFORMERS_URL).catch((err) => {
    cached = null; // allow a retry after a network failure
    throw err;
  });
  return cached;
}

/** Aggregates per-file download progress into a single 0-100 figure. */
export function progressTracker(onPercent: (percent: number) => void) {
  const files: Record<string, number> = {};
  return (p: ProgressEvent) => {
    if (p.status === 'progress' && p.file && typeof p.progress === 'number') {
      files[p.file] = p.progress;
      const values = Object.values(files);
      onPercent(values.reduce((a, b) => a + b, 0) / values.length);
    }
  };
}
