import { personas } from './persona';

export interface VisitContext {
  /** Company name from ?for=, cleaned for display (may be empty). */
  company: string;
  /** Persona label matched from ?role= (id or label), if any. */
  persona: string | null;
}

const clean = (v: string | null) => (v ?? '').replace(/[^A-Za-z0-9 &.,/+_-]/g, '').trim().slice(0, 40);
const titleCase = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();

function parse(): VisitContext {
  try {
    const q = new URLSearchParams(window.location.search);
    const roleRaw = clean(q.get('role')).toLowerCase();
    const persona = personas.find((p) => p.id === roleRaw || p.label.toLowerCase() === roleRaw);
    return { company: titleCase(clean(q.get('for'))), persona: persona?.label ?? null };
  } catch {
    return { company: '', persona: null };
  }
}

/** Read once at load: personalised links look like /?for=acme&role=ml */
export const visitContext: VisitContext = parse();

export function buildPersonalLink(company: string, roleId?: string): string {
  const url = new URL(window.location.origin + '/');
  if (company) url.searchParams.set('for', company.trim().toLowerCase().replace(/\s+/g, '-'));
  if (roleId) url.searchParams.set('role', roleId);
  return url.toString();
}
