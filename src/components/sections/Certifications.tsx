import { useState } from 'react';
import { AnimatedSection, Card, TiltCard, ShowMoreButton } from '../ui';
import { HiBadgeCheck, HiExternalLink } from 'react-icons/hi';
import { FaLinkedin } from 'react-icons/fa';
import certificationsData from '../../data/certifications.json';
import aboutData from '../../data/about.json';
import type { Certification } from '../../types/certification.types';

const certifications: Certification[] = certificationsData;

// LinkedIn's standard page listing every certification on a profile, built from the profile link
const linkedinCertificationsUrl = `${aboutData.social.linkedin.replace(/\/$/, '')}/details/certifications/`;

const accents = [
  'from-primary to-accent',
  'from-secondary to-primary',
  'from-accent to-secondary',
];

const INITIAL_COUNT = 4;

// Name the platform a credential is verified on, so "Verify" says where it goes
const verifierName = (url: string): string | null => {
  try {
    const host = new URL(url).hostname;
    if (host.endsWith('credly.com')) return 'Credly';
    if (host.endsWith('learn.microsoft.com')) return 'Microsoft Learn';
  } catch { /* fall through to the generic label */ }
  return null;
};

export const Certifications = () => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? certifications : certifications.slice(0, INITIAL_COUNT);

  return (
    <section id="certifications" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 heading-shimmer">
            Certifications
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map((cert, index) => {
              const accent = accents[index % accents.length];
              return (
                <AnimatedSection key={cert.id} delay={index * 0.08}>
                  <TiltCard maxTilt={5} scale={1.02} className="h-full rounded-lg">
                    <Card className="h-full" title={cert.description}>
                      <div className="flex flex-col h-full">
                        <div
                          className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-lg`}
                        >
                          <HiBadgeCheck className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">
                          {cert.name}
                        </h3>
                        <p className="text-primary text-sm font-semibold mb-3">
                          {cert.issuer}
                        </p>
                        <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {cert.date}
                            {cert.expires ? ` · expires ${cert.expires}` : ''}
                          </p>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Verify credential: ${cert.name}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
                            >
                              {verifierName(cert.credentialUrl) ? `Verify on ${verifierName(cert.credentialUrl)}` : 'Verify'}{' '}
                              <HiExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {cert.credentialId && (
                          <p className="mt-1 text-[10px] text-gray-400 font-mono break-all">ID: {cert.credentialId}</p>
                        )}
                      </div>
                    </Card>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>

          {certifications.length > INITIAL_COUNT && (
            <ShowMoreButton
              expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
              hiddenCount={certifications.length - INITIAL_COUNT}
            />
          )}

          <div className="mt-8 text-center">
            <a
              href={linkedinCertificationsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <FaLinkedin className="w-4 h-4" />
              See and verify these on LinkedIn
              <HiExternalLink className="w-4 h-4" />
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
