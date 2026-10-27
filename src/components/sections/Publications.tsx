import { AnimatedSection, Card, Badge, TiltCard } from '../ui';
import { HiDocumentText, HiExternalLink, HiCode } from 'react-icons/hi';
import { publications, published, accepted, submitted, statusOf } from '../../lib/publications';
import type { PublicationStatus } from '../../types/publication.types';

const accents = [
  'from-primary via-accent to-primary',
  'from-secondary via-primary to-secondary',
];

const statusLabel: Record<PublicationStatus, string> = {
  published: 'Published',
  accepted: 'Accepted',
  submitted: 'Submitted',
};

// A dark pill with white text reads on any gradient; the dot carries the status colour
const statusDot: Record<PublicationStatus, string> = {
  published: 'bg-emerald-400',
  accepted: 'bg-amber-300',
  submitted: 'bg-gray-300',
};

// "2 published · 1 accepted · 2 submitted": says exactly where each paper stands
const summary = [
  published.length && `${published.length} published`,
  accepted.length && `${accepted.length} accepted`,
  submitted.length && `${submitted.length} submitted`,
]
  .filter(Boolean)
  .join(' · ');

export const Publications = () => {
  return (
    <section id="publications" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-2 heading-shimmer">
            Publications
          </h2>
          <p className="text-center font-mono text-xs text-secondary/80 mb-10">// {summary}</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {publications.map((pub, index) => {
              const status = statusOf(pub);
              return (
                <AnimatedSection key={pub.id} delay={index * 0.12}>
                  <TiltCard maxTilt={4} scale={1.015} className="h-full rounded-lg">
                    <Card className="h-full !p-0 overflow-hidden">
                      <div
                        className={`h-24 bg-gradient-to-br ${accents[index % accents.length]} flex items-center justify-between px-6`}
                      >
                        <HiDocumentText className="w-9 h-9 text-white/90 shrink-0" />
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/25 bg-black/75 text-white text-xs font-semibold">
                          <span className={`w-2 h-2 rounded-full ${statusDot[status]}`} aria-hidden="true" />
                          {statusLabel[status]}
                        </span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3 line-clamp-3">
                          {pub.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge text={pub.publisher} />
                          <Badge text={pub.type} />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{pub.date}</span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">
                          {pub.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                          {pub.link && (
                            <a
                              href={pub.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-sm"
                            >
                              View Publication
                              <HiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {pub.codeUrl && (
                            <a
                              href={pub.codeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-secondary hover:underline font-medium text-sm"
                            >
                              <HiCode className="w-4 h-4" />
                              {pub.codeLabel ?? 'Code'}
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  </TiltCard>
                </AnimatedSection>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
