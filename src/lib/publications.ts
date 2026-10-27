import publicationsData from '../data/publications.json';
import type { Publication, PublicationStatus } from '../types/publication.types';

const rank: Record<PublicationStatus, number> = { published: 0, accepted: 1, submitted: 2 };
export const statusOf = (p: Publication): PublicationStatus => p.status ?? 'published';

/** Published first, then accepted, then submitted (stable within each group). */
export const publications: Publication[] = [...(publicationsData as Publication[])].sort(
  (a, b) => rank[statusOf(a)] - rank[statusOf(b)]
);

// Counts are kept per status so nothing can call an unpublished paper "peer-reviewed"
export const published = publications.filter((p) => statusOf(p) === 'published');
export const accepted = publications.filter((p) => statusOf(p) === 'accepted');
export const submitted = publications.filter((p) => statusOf(p) === 'submitted');
