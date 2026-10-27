export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
  /** Public page where the credential can be verified (issuer site, Credly, LinkedIn "Show credential", ...). */
  credentialUrl?: string;
  /** The credential ID printed on the certificate / shown on LinkedIn. */
  credentialId?: string;
}
