export type PublicationStatus = 'published' | 'accepted' | 'submitted';

export interface Publication {
  id: string;
  title: string;
  /** Journal, publisher or conference. */
  publisher: string;
  date: string;
  description: string;
  type: string;
  /** Omitted means published. Only published work is counted as "peer-reviewed" anywhere on the site. */
  status?: PublicationStatus;
  /** The paper itself (only once it exists publicly). */
  link?: string;
  /** Code and/or data that accompanies the paper. */
  codeUrl?: string;
  codeLabel?: string;
}
