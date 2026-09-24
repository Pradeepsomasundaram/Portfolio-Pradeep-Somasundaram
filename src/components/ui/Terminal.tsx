import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/appStore';
import aboutData from '../../data/about.json';
import projectsData from '../../data/projects.json';
import experienceData from '../../data/experience.json';
import skillsData from '../../data/skills.json';
import educationData from '../../data/education.json';
import certificationsData from '../../data/certifications.json';
import { buildPersonalLink } from '../../lib/visitContext';
import { personas } from '../../lib/persona';

interface Line {
  kind: 'in' | 'out';
  text: string;
}

const SECTIONS = ['hero', 'about', 'experience', 'education', 'skills', 'universe', 'projects', 'github', 'demo', 'certifications', 'publications', 'awards', 'volunteering', 'organizations', 'testimonials', 'contact'];
const githubLogin = aboutData.social.github.split('/').filter(Boolean).pop() ?? '';

const HELP = `Commands:
  whoami               who is Pradeep
  ls [projects|skills] list things (try: ls projects)
  cat <file>           about | experience | skills | education | certs
  open <n|project-id>  open a project (number from "ls projects")
  goto <section>       scroll the page (${SECTIONS.slice(0, 6).join(', ')}, ...)
  github               live GitHub stats
  link <company> [role] make a personalised link (roles: ml, de, agentic, fullstack)
  contact              how to reach him
  clear | exit         clear the screen | close the terminal`;

const BANNER = `pradeep-os v1.0 — type "help" to get started.`;

async function githubStats(): Promise<string> {
  const [user, repos] = await Promise.all([
    fetch(`https://api.github.com/users/${githubLogin}`).then((r) => (r.ok ? r.json() : Promise.reject())),
    fetch(`https://api.github.com/users/${githubLogin}/repos?per_page=100&sort=pushed`).then((r) => (r.ok ? r.json() : Promise.reject())),
  ]);
  const own = (repos as { name: string; fork: boolean; language: string | null }[]).filter((r) => !r.fork);
  const recent = own.slice(0, 3).map((r) => `  - ${r.name}${r.language ? ` (${r.language})` : ''}`).join('\n');
  return `${user.login}: ${user.public_repos} public repos, ${user.followers} followers\nRecently updated:\n${recent}`;
}

/** A tiny fake shell over the real portfolio data — a fun way to explore. */
export const Terminal = () => {
  const { terminalOpen, setTerminalOpen, openProject } = useAppStore();
  const [lines, setLines] = useState<Line[]>([{ kind: 'out', text: BANNER }]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Backtick toggles the terminal (unless the visitor is typing in a field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
      if (e.key === '`' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setTerminalOpen(!useAppStore.getState().terminalOpen);
      } else if (e.key === 'Escape' && useAppStore.getState().terminalOpen) {
        setTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTerminalOpen]);

  useEffect(() => {
    if (terminalOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [terminalOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);

  const print = useCallback((text: string) => setLines((l) => [...l, { kind: 'out', text }]), []);

  const run = useCallback(
    async (raw: string) => {
      const input = raw.trim();
      setLines((l) => [...l, { kind: 'in', text: input }]);
      if (!input) return;
      setHistory((h) => [...h, input]);
      setCursor(-1);

      const [cmd, ...args] = input.split(/\s+/);
      const arg = args.join(' ').toLowerCase();

      switch (cmd.toLowerCase()) {
        case 'help':
          return print(HELP);
        case 'whoami':
          return print(`${aboutData.name}\n${aboutData.tagline}\n${aboutData.roles[0]} · ${aboutData.stats.yearsExperience} years experience`);
        case 'ls':
          if (arg === 'projects')
            return print(projectsData.map((p, i) => `${String(i + 1).padStart(2)}  ${p.id.padEnd(30)} ${p.category}`).join('\n'));
          if (arg === 'skills') return print(Object.keys(skillsData).join('\n'));
          return print('projects/  skills/  experience  education  certs  about');
        case 'cat': {
          if (arg === 'about') return print(`${aboutData.bio}.\n${aboutData.tagline}`);
          if (arg === 'experience')
            return print(experienceData.map((e) => `${e.role} — ${e.company} (${e.dateRange})`).join('\n'));
          if (arg === 'skills')
            return print(Object.entries(skillsData).map(([g, items]) => `${g}: ${(items as string[]).slice(0, 8).join(', ')}`).join('\n'));
          if (arg === 'education')
            return print(educationData.map((e) => `${e.institution} — ${e.degree}${e.field ? `, ${e.field}` : ''} (${e.dateRange})`).join('\n'));
          if (arg === 'certs')
            return print(certificationsData.map((c) => `${c.name} — ${c.issuer} (${c.date})`).join('\n'));
          return print('usage: cat about | experience | skills | education | certs');
        }
        case 'open': {
          const n = Number(arg);
          const project = Number.isInteger(n) && n > 0 ? projectsData[n - 1] : projectsData.find((p) => p.id.toLowerCase() === arg);
          if (!project) return print('No such project. Try "ls projects".');
          print(`Opening ${project.title}...`);
          setTerminalOpen(false);
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => openProject(project.id), 500);
          return;
        }
        case 'goto': {
          if (!SECTIONS.includes(arg)) return print(`Sections: ${SECTIONS.join(', ')}`);
          setTerminalOpen(false);
          document.getElementById(arg)?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        case 'github':
          print('Fetching from the GitHub API...');
          try {
            return print(await githubStats());
          } catch {
            return print('Could not reach GitHub right now.');
          }
        case 'contact':
          return print(`email     ${aboutData.social.email}\nlinkedin  ${aboutData.social.linkedin}\ngithub    ${aboutData.social.github}`);
        case 'link': {
          const [company, roleArg] = [args[0] ?? '', args[1]?.toLowerCase()];
          if (!company) return print('usage: link <company> [ml|de|agentic|fullstack]   e.g. link acme ml');
          const role = personas.find((p) => p.id === roleArg);
          if (roleArg && !role) return print(`Unknown role. Choose: ${personas.map((p) => p.id).join(', ')}`);
          const url = buildPersonalLink(company, role?.id);
          try {
            await navigator.clipboard.writeText(url);
            return print(`${url}\n(copied to clipboard)`);
          } catch {
            return print(url);
          }
        }
        case 'sudo':
          return print(arg.includes('hire') ? 'Permission granted. Excellent decision.\n→ ' + aboutData.social.email : 'pradeep is not in the sudoers file. This incident will be reported.');
        case 'clear':
          return setLines([]);
        case 'exit':
          return setTerminalOpen(false);
        default:
          return print(`command not found: ${cmd}. Try "help".`);
      }
    },
    [print, setTerminalOpen, openProject]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const v = value;
      setValue('');
      void run(v);
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown' && cursor !== -1) {
      e.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue('');
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    }
  };

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setTerminalOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-label="Terminal"
            className="w-full max-w-2xl rounded-xl overflow-hidden border border-primary/30 shadow-glow bg-[#0b0b0b]"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.focus();
            }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
              <button aria-label="Close terminal" onClick={() => setTerminalOpen(false)} className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 font-mono text-xs text-gray-400">pradeep@portfolio: ~</span>
            </div>
            <div className="font-mono text-sm text-gray-200 p-4 h-80 overflow-y-auto">
              {lines.map((l, i) => (
                <pre key={i} className={`whitespace-pre-wrap break-words ${l.kind === 'in' ? 'text-primary' : ''}`}>
                  {l.kind === 'in' ? `$ ${l.text}` : l.text}
                </pre>
              ))}
              <div className="flex items-center gap-2 text-primary">
                <span>$</span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="flex-1 bg-transparent outline-none text-gray-100 caret-primary"
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal command"
                />
              </div>
              <div ref={endRef} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
