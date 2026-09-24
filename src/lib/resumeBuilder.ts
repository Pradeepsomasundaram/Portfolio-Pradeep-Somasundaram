import aboutData from '../data/about.json';
import experienceData from '../data/experience.json';
import projectsData from '../data/projects.json';
import skillsData from '../data/skills.json';
import educationData from '../data/education.json';
import certificationsData from '../data/certifications.json';
import { analyzeJobDescription } from './assistantEngine';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const overlap = (haystack: string[], terms: string[]) => {
  const h = haystack.join(' ').toLowerCase();
  return terms.filter((t) => h.includes(t.toLowerCase())).length;
};

/** Builds a printable one-page resume from Pradeep's real data, reordered to
 * lead with whatever a pasted job description asks for. Nothing is invented:
 * it only re-sorts and selects existing entries. */
export function buildTailoredResumeHtml(jdText: string): string {
  const { matched } = analyzeJobDescription(jdText);

  const skillGroups = Object.entries(skillsData)
    .map(([group, items]) => {
      const list = items as string[];
      const hits = list.filter((s) => matched.some((m) => m.toLowerCase() === s.toLowerCase()));
      const rest = list.filter((s) => !hits.includes(s));
      return { group, hits, items: [...hits, ...rest].slice(0, 12), score: hits.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const experience = experienceData.slice(0, 4).map((e) => {
    const bullets = [...e.achievements]
      .map((a, i) => ({ a, i, score: overlap([a], matched) }))
      .sort((x, y) => y.score - x.score || x.i - y.i)
      .slice(0, 3)
      .map((x) => x.a);
    return { ...e, bullets };
  });

  const projects = projectsData
    .map((p) => ({ p, score: overlap(p.technologies, matched) }))
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, 4)
    .map((x) => x.p);

  const focus = matched.slice(0, 6).join(', ');
  const social = aboutData.social;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(aboutData.name)} — Resume</title>
<style>
  @page { size: letter; margin: 0.5in; }
  * { box-sizing: border-box; }
  body { font: 10pt/1.35 Helvetica, Arial, sans-serif; color: #111; margin: 0; }
  h1 { font-size: 20pt; margin: 0; letter-spacing: 0.3px; }
  .tag { color: #555; margin: 2px 0 4px; }
  .contact { font-size: 9pt; color: #333; }
  h2 { font-size: 10.5pt; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid #B8901F; padding-bottom: 2px; margin: 12px 0 6px; color: #7a5c0a; }
  .row { display: flex; justify-content: space-between; gap: 12px; }
  .row b { font-size: 10.5pt; }
  .meta { color: #555; font-size: 9pt; white-space: nowrap; }
  ul { margin: 3px 0 6px 16px; padding: 0; }
  li { margin: 1px 0; }
  .skills p { margin: 2px 0; }
  .hit { font-weight: 700; }
  .small { font-size: 9pt; color: #333; }
</style></head><body>
<h1>${esc(aboutData.name)}</h1>
<div class="tag">${esc(aboutData.roles[0])} · ${esc(aboutData.tagline)}</div>
<div class="contact">${esc(social.email)} · ${esc(social.linkedin.replace('https://www.', ''))} · ${esc(social.github.replace('https://', ''))}</div>

<h2>Profile</h2>
<p>${esc(aboutData.roles[0])} with ${esc(aboutData.stats.yearsExperience)} years across data science, data engineering and AI/ML. ${esc(aboutData.bio)}.${focus ? ` Relevant strengths for this role: ${esc(focus)}.` : ''}</p>

<h2>Skills</h2>
<div class="skills">${skillGroups
    .map(
      (g) =>
        `<p><b>${esc(g.group)}:</b> ${g.items
          .map((s) => (g.hits.includes(s) ? `<span class="hit">${esc(s)}</span>` : esc(s)))
          .join(', ')}</p>`
    )
    .join('')}</div>

<h2>Experience</h2>
${experience
    .map(
      (e) => `<div class="row"><b>${esc(e.role)} — ${esc(e.company)}</b><span class="meta">${esc(e.dateRange)}</span></div>
<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    )
    .join('')}

<h2>Selected Projects</h2>
<ul>${projects
    .map((p) => `<li><b>${esc(p.title)}</b> (${esc(p.technologies.slice(0, 5).join(', '))}) — ${esc(p.description.split('. ')[0].replace(/\.$/, ''))}.</li>`)
    .join('')}</ul>

<h2>Education</h2>
${educationData
    .slice(0, 2)
    .map(
      (e) => `<div class="row"><span><b>${esc(e.institution)}</b> — ${esc(e.degree)}${e.field ? `, ${esc(e.field)}` : ''}</span><span class="meta">${esc(e.dateRange)}</span></div>`
    )
    .join('')}

<h2>Certifications</h2>
<p class="small">${certificationsData.map((c) => `${esc(c.name)} (${esc(c.issuer)}, ${esc(c.date)})`).join(' · ')}</p>
</body></html>`;
}

/** Opens the browser's print dialog (Save as PDF) for the tailored resume,
 * using a hidden iframe so popup blockers never get involved. */
export function printTailoredResume(jdText: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) return;
  doc.open();
  doc.write(buildTailoredResumeHtml(jdText));
  doc.close();
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 2000);
  }, 250);
}
