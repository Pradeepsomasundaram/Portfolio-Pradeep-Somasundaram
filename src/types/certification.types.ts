export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  /** When the credential lapses, if it does (e.g. "Oct 2029"). */
  expires?: string;
  description: string;
  /** Public page where the credential can be verified (issuer site, Credly, LinkedIn "Show credential", ...). */
  credentialUrl?: string;
  /** The credential ID printed on the certificate / shown on LinkedIn. */
  credentialId?: string;
}
