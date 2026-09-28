#!/usr/bin/env node
// Flags facts that differ between the downloadable resume PDF and the site's own
// data (which the resume is often tailored differently from on purpose — e.g. a
// role-specific title). This never fails the build; it's a heads-up for a human,
// so an update to one doesn't silently drift from the other a second time.
import { readFileSync } from 'node:fs';
import { PDFParse } from 'pdf-parse';

const RESUME = 'public/assets/Pradeep_Somasundaram_Res.pdf';
const about = JSON.parse(readFileSync('src/data/about.json', 'utf8'));
const experience = JSON.parse(readFileSync('src/data/experience.json', 'utf8'));

const parser = new PDFParse({ data: readFileSync(RESUME) });
const { text } = await parser.getText();
await parser.destroy?.();
const flat = text.replace(/\s+/g, ' ');

const findings = [];
const check = (label, expected, present) => {
  if (expected && !present) findings.push(`${label}: site says "${expected}", not found in the resume text`);
};

check('Email', about.social.email, flat.includes(about.social.email));

const current = experience.find((e) => e.featured) ?? experience[0];
check('Current employer', current.company, flat.includes(current.company));

const [city] = (current.location ?? '').split(',').map((s) => s.trim());
check('Current role location (city)', city, city ? flat.includes(city) : true);

if (findings.length === 0) {
  console.log('check-resume-sync: no mismatches found between the resume PDF and site data.');
} else {
  console.warn('check-resume-sync: possible drift between the resume PDF and site data (only a heads-up — a tailored resume can legitimately differ, e.g. its title):');
  for (const f of findings) console.warn(`  - ${f}`);
}
// Always exits 0: informational only, never blocks a build over a legitimately tailored resume.
