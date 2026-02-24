import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChat, HiX, HiPaperAirplane } from 'react-icons/hi';
import { useAppStore } from '../../stores/appStore';
import type { Message } from '../../types/chatbot.types';
import aboutData from '../../data/about.json';
import projectsData from '../../data/projects.json';
import skillsData from '../../data/skills.json';
import experienceData from '../../data/experience.json';
import educationData from '../../data/education.json';
import certificationsData from '../../data/certifications.json';
import publicationsData from '../../data/publications.json';
import volunteeringData from '../../data/volunteering.json';
import awardsData from '../../data/awards.json';
import organizationsData from '../../data/organizations.json';
import testimonialsData from '../../data/testimonials.json';

// --- Intent scoring system ---
interface Intent {
  name: string;
  keywords: [string, number][]; // [keyword, weight]
  handler: () => { text: string; followUps: string[] };
}

function scoreIntent(input: string, keywords: [string, number][]): number {
  const lower = input.toLowerCase();
  let score = 0;
  for (const [keyword, weight] of keywords) {
    if (lower.includes(keyword)) {
      score += weight;
      // Bonus for exact word match (not substring)
      if (new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(input)) {
        score += weight * 0.5;
      }
    }
  }
  return score;
}

function buildIntents(): Intent[] {
  return [
    // --- Greetings ---
    {
      name: 'greeting',
      keywords: [
        ['hello', 3], ['hi', 3], ['hey', 3], ['howdy', 3], ['greetings', 3],
        ["what's up", 3], ['sup', 2], ['good morning', 3], ['good evening', 3],
        ['good afternoon', 3], ['yo', 2],
      ],
      handler: () => ({
        text: `Hello! Welcome to Pradeep's portfolio. I can help you learn about his professional background, projects, skills, and more.\n\nHere are some things you can ask me:\n- His current role and work experience\n- Technical skills and certifications\n- Projects he's built\n- Education and research publications\n- How to get in touch\n\nWhat would you like to know?`,
        followUps: ['Who is Pradeep?', 'Current role', 'Top projects', 'Skills overview'],
      }),
    },

    // --- About / Who is Pradeep ---
    {
      name: 'about',
      keywords: [
        ['who is', 4], ['about', 3], ['tell me about', 5], ['introduce', 4],
        ['who are you', 3], ['yourself', 2], ['pradeep', 2], ['summary', 3],
        ['overview', 3], ['brief', 2], ['profile', 3],
      ],
      handler: () => {
        const currentRole = experienceData[0];
        const totalSkills = Object.values(skillsData).flat().length;
        return {
          text: `Pradeep Somasundaram is a ${aboutData.roles.join(', ')} based in Atlanta, Georgia.\n\n${aboutData.bio}\n\nQuick stats:\n- ${aboutData.stats.yearsExperience} years of experience\n- ${aboutData.stats.projectsCompleted} projects completed\n- ${totalSkills}+ technologies mastered\n- ${certificationsData.length} professional certifications\n- ${publicationsData.length} peer-reviewed publications\n\nCurrently working as ${currentRole.role} at ${currentRole.company}.`,
          followUps: ['Work experience', 'Education', 'Top projects', 'Contact info'],
        };
      },
    },

    // --- Experience ---
    {
      name: 'experience',
      keywords: [
        ['experience', 5], ['work', 3], ['job', 4], ['career', 4], ['current role', 5],
        ['company', 3], ['employment', 4], ['where does he work', 5],
        ['professional', 2], ['role', 3], ['position', 3], ['working', 2],
      ],
      handler: () => {
        const expSummary = experienceData
          .map((exp) => {
            const tag = exp.featured ? ' [Current]' : '';
            return `- ${exp.role} at ${exp.company}${tag}\n  ${exp.dateRange} | ${exp.location} | ${exp.type}\n  ${exp.achievements[0]}`;
          })
          .join('\n\n');

        return {
          text: `Pradeep has ${experienceData.length} professional roles spanning data science, data engineering, AI/ML, and IoT:\n\n${expSummary}\n\nHe has worked across industries including logistics (UPS), manufacturing (BMSC), education (CEAC), consulting (IBM), and automation (Shree Kay Vee).`,
          followUps: ['UPS role details', 'BMSC role details', 'Skills overview', 'Projects'],
        };
      },
    },

    // --- UPS specific ---
    {
      name: 'ups',
      keywords: [
        ['ups', 6], ['current job', 5], ['current company', 5], ['logistics', 3],
        ['supply chain', 3], ['atlanta', 2],
      ],
      handler: () => {
        const ups = experienceData.find((e) => e.company === 'UPS')!;
        return {
          text: `Pradeep currently works as a ${ups.role} at ${ups.company} (${ups.dateRange}).\n\nLocation: ${ups.location}\nType: ${ups.type}\n\n${ups.description}\n\nKey focus areas:\n${ups.achievements.map((a) => `- ${a}`).join('\n')}\n\nTechnologies: ${ups.technologies.join(', ')}`,
          followUps: ['Previous roles', 'Skills', 'Projects', 'Education'],
        };
      },
    },

    // --- BMSC specific ---
    {
      name: 'bmsc',
      keywords: [
        ['bmsc', 6], ['beauty manufacturing', 6], ['data engineer', 4],
        ['data lake', 4], ['sage x3', 5],
      ],
      handler: () => {
        const bmsc = experienceData.find((e) => e.company === 'Beauty Manufacturing Solutions Corp')!;
        return {
          text: `At ${bmsc.company}, Pradeep served as ${bmsc.role} (${bmsc.dateRange}).\n\nLocation: ${bmsc.location}\n\nKey achievements:\n${bmsc.achievements.map((a) => `- ${a}`).join('\n')}\n\nTechnologies used: ${bmsc.technologies.join(', ')}\n\nThis role combined data engineering, data science, and ERP system administration to deliver scalable, data-driven solutions.`,
          followUps: ['Current role at UPS', 'Data engineering skills', 'AWS experience', 'All experience'],
        };
      },
    },

    // --- Skills ---
    {
      name: 'skills',
      keywords: [
        ['skill', 5], ['technolog', 4], ['what can he do', 5], ['tech stack', 5],
        ['tools', 3], ['programming', 4], ['languages', 3], ['frameworks', 4],
        ['proficient', 3], ['expertise', 3], ['capable', 2],
      ],
      handler: () => {
        const categories = Object.entries(skillsData);
        const summary = categories
          .map(
            ([cat, skills]) =>
              `- ${cat}: ${(skills as string[]).slice(0, 5).join(', ')}${(skills as string[]).length > 5 ? ` (+${(skills as string[]).length - 5} more)` : ''}`
          )
          .join('\n');

        const totalSkills = Object.values(skillsData).flat().length;

        return {
          text: `Pradeep is proficient in ${totalSkills}+ technologies across ${categories.length} categories:\n\n${summary}\n\nHe continuously expands his skill set through hands-on projects, certifications, and professional experience.`,
          followUps: ['Certifications', 'ML/AI expertise', 'Data engineering tools', 'Projects using these skills'],
        };
      },
    },

    // --- Projects ---
    {
      name: 'projects',
      keywords: [
        ['project', 5], ['portfolio', 3], ['built', 3], ['created', 3],
        ['developed', 3], ['application', 2], ['app', 2], ['demo', 2],
        ['github', 2], ['repository', 2], ['showcase', 3],
      ],
      handler: () => {
        const featured = projectsData.filter((p) => p.featured);
        const categories = [...new Set(projectsData.map((p) => p.category))];

        const summary = featured
          .slice(0, 5)
          .map((p) => `- ${p.title} (${p.category})\n  ${p.description.slice(0, 120)}...`)
          .join('\n\n');

        return {
          text: `Pradeep has built ${projectsData.length}+ projects spanning ${categories.join(', ')}.\n\nFeatured projects:\n\n${summary}\n\nProjects range from deep learning models and NLP systems to full-stack web apps and IoT platforms. Visit the Projects page to explore them all with filters and search!`,
          followUps: ['ML/AI projects', 'Web development projects', 'Skills used', 'Publications'],
        };
      },
    },

    // --- Education ---
    {
      name: 'education',
      keywords: [
        ['education', 5], ['university', 4], ['degree', 5], ['college', 4],
        ['school', 3], ['study', 3], ['graduated', 4], ['gpa', 5],
        ['cgpa', 5], ['masters', 5], ['bachelor', 5], ['gwu', 5],
        ['george washington', 6], ['anna university', 6], ['academic', 3],
      ],
      handler: () => {
        const eduSummary = educationData
          .map(
            (edu) =>
              `- ${edu.degree} in ${edu.field}\n  ${edu.institution} (${edu.dateRange})\n  Grade: ${edu.grade} | ${edu.location}\n  Activities: ${edu.activities}`
          )
          .join('\n\n');

        return {
          text: `Pradeep's educational background:\n\n${eduSummary}\n\nHis coursework covered advanced machine learning, deep learning, NLP, cloud computing, big data analytics, and statistical modeling.\n\nHe graduated with top grades from both programs, demonstrating strong academic excellence.`,
          followUps: ['Publications', 'Certifications', 'Awards', 'Current role'],
        };
      },
    },

    // --- Certifications ---
    {
      name: 'certifications',
      keywords: [
        ['certif', 5], ['credential', 4], ['certified', 5], ['certification', 5],
        ['micro1', 4], ['aws academy', 4],
      ],
      handler: () => {
        const certSummary = certificationsData
          .map((cert) => `- ${cert.name} — ${cert.issuer} (${cert.date})`)
          .join('\n');

        return {
          text: `Pradeep holds ${certificationsData.length} professional certifications:\n\n${certSummary}\n\nThese validate his expertise across data science, cloud architecture, IoT, and programming.`,
          followUps: ['Skills overview', 'Education', 'AWS experience', 'Projects'],
        };
      },
    },

    // --- Publications ---
    {
      name: 'publications',
      keywords: [
        ['publication', 5], ['research', 4], ['paper', 4], ['ieee', 5],
        ['springer', 5], ['published', 4], ['journal', 4], ['conference', 3],
        ['semiconductor', 4], ['ecg', 3],
      ],
      handler: () => {
        const pubSummary = publicationsData
          .map(
            (pub) =>
              `- "${pub.title}"\n  Published in ${pub.publisher} (${pub.date}) — ${pub.type}\n  ${pub.description.slice(0, 150)}...`
          )
          .join('\n\n');

        return {
          text: `Pradeep has ${publicationsData.length} peer-reviewed publications:\n\n${pubSummary}\n\nHis research spans deep learning for manufacturing quality control and machine learning for biomedical signal processing.`,
          followUps: ['Education', 'ML/AI expertise', 'Awards', 'Projects'],
        };
      },
    },

    // --- Awards ---
    {
      name: 'awards',
      keywords: [
        ['award', 5], ['honor', 4], ['achievement', 3], ['recognition', 4],
        ['prize', 4], ['won', 3], ['hackathon', 4],
      ],
      handler: () => {
        const awardSummary = awardsData
          .map((a) => `- ${a.title} — ${a.issuer} (${a.date})\n  ${a.description}`)
          .join('\n\n');

        return {
          text: `Pradeep's honors and awards:\n\n${awardSummary}\n\nThese recognize his contributions to international policy forums, community service, research, and academic excellence.`,
          followUps: ['Volunteering', 'Publications', 'Education', 'Experience'],
        };
      },
    },

    // --- Volunteering ---
    {
      name: 'volunteering',
      keywords: [
        ['volunteer', 5], ['community', 3], ['imf', 5], ['red cross', 5],
        ['social', 2], ['giving back', 4], ['humanitarian', 3], ['charity', 3],
      ],
      handler: () => {
        const volSummary = volunteeringData
          .map(
            (v) =>
              `- ${v.role} at ${v.organization} (${v.dateRange})\n  ${v.description.slice(0, 120)}...`
          )
          .join('\n\n');

        return {
          text: `Pradeep actively gives back through volunteering:\n\n${volSummary}\n\nHis volunteer work reflects his commitment to economic empowerment, humanitarian aid, and community service.`,
          followUps: ['Organizations', 'Awards', 'About Pradeep', 'Contact'],
        };
      },
    },

    // --- Organizations ---
    {
      name: 'organizations',
      keywords: [
        ['organization', 5], ['member', 3], ['membership', 4], ['club', 3],
        ['society', 4], ['equinox', 5], ['iete', 5], ['association', 3],
      ],
      handler: () => {
        const orgSummary = organizationsData
          .map((o) => {
            const assoc = 'association' in o ? ` (${(o as { association: string }).association})` : '';
            return `- ${o.name}${assoc}\n  ${o.role} | ${o.dateRange}\n  ${o.description.slice(0, 100)}...`;
          })
          .join('\n\n');

        return {
          text: `Pradeep is an active member of ${organizationsData.length} professional organizations:\n\n${orgSummary}\n\nThese memberships demonstrate his commitment to continuous learning and community engagement.`,
          followUps: ['Volunteering', 'Certifications', 'Awards', 'Education'],
        };
      },
    },

    // --- Testimonials ---
    {
      name: 'testimonials',
      keywords: [
        ['testimonial', 5], ['recommendation', 5], ['review', 3], ['feedback', 3],
        ['what others say', 5], ['colleagues', 3], ['reference', 3], ['endorse', 3],
      ],
      handler: () => {
        const testSummary = testimonialsData
          .map((t) => `"${t.text}"\n  — ${t.name}, ${t.role}`)
          .join('\n\n');

        return {
          text: `Here's what others say about Pradeep:\n\n${testSummary}\n\nVisit the Testimonials page for more details!`,
          followUps: ['Experience', 'Projects', 'Skills', 'Contact'],
        };
      },
    },

    // --- Contact ---
    {
      name: 'contact',
      keywords: [
        ['contact', 5], ['email', 4], ['reach', 3], ['hire', 4], ['connect', 3],
        ['linkedin', 5], ['github', 4], ['phone', 3], ['message', 2],
        ['get in touch', 5], ['reach out', 4],
      ],
      handler: () => ({
        text: `You can connect with Pradeep through:\n\n- Email: ${aboutData.social.email}\n- LinkedIn: linkedin.com/in/pradeep-somasundaram-835230192\n- GitHub: github.com/PradeepSomasundaram1512\n- Location: Atlanta, Georgia\n\nHe's currently open to exploring new technologies and collaborations. You can also use the Contact page to send a message directly!`,
        followUps: ['Current role', 'Resume', 'About Pradeep', 'Projects'],
      }),
    },

    // --- Resume ---
    {
      name: 'resume',
      keywords: [
        ['resume', 5], ['cv', 5], ['download', 3], ['pdf', 3],
      ],
      handler: () => ({
        text: `You can download Pradeep's resume by clicking the "Download Resume" button on the Home page.\n\nThe resume covers:\n- ${experienceData.length} professional roles across data science, ML, and engineering\n- MS in Data Science from GWU (Grade: A)\n- BE in EEE from Anna University (CGPA: 9.21)\n- ${Object.values(skillsData).flat().length}+ technical skills\n- ${certificationsData.length} certifications\n- ${publicationsData.length} research publications`,
        followUps: ['Experience details', 'Skills', 'Education', 'Contact'],
      }),
    },

    // --- ML / AI ---
    {
      name: 'ml_ai',
      keywords: [
        ['machine learning', 6], ['deep learning', 6], ['nlp', 5],
        ['artificial intelligence', 6], ['neural network', 5], ['tensorflow', 5],
        ['pytorch', 5], ['model', 3], ['prediction', 3], ['classification', 4],
        ['computer vision', 5], ['llm', 5], ['gpt', 4], ['transformer', 4],
        ['bert', 5], ['langchain', 5],
      ],
      handler: () => {
        const mlProjects = projectsData.filter(
          (p) =>
            p.category === 'Machine Learning' ||
            p.category === 'AI/NLP' ||
            p.category === 'Deep Learning'
        );

        const projectList = mlProjects
          .slice(0, 4)
          .map((p) => `- ${p.title}: ${p.description.slice(0, 80)}...`)
          .join('\n');

        return {
          text: `Pradeep has strong expertise in AI/ML:\n\n- ${mlProjects.length}+ ML/AI projects including deep learning, NLP, and computer vision\n- ${publicationsData.length} research publications (IEEE, Springer)\n- MS in Data Science from GWU with focus on ML\n- Certified Data Scientist (micro1)\n\nKey technologies: Python, TensorFlow, PyTorch, Scikit-learn, Hugging Face, OpenAI APIs, LangChain, BERT, XGBoost\n\nNotable ML projects:\n${projectList}\n\nHis work includes semiconductor defect classification, emotion detection from ECG signals, and building scalable ML pipelines.`,
          followUps: ['All projects', 'Publications', 'Data engineering', 'Skills breakdown'],
        };
      },
    },

    // --- Data Engineering ---
    {
      name: 'data_engineering',
      keywords: [
        ['data engineer', 5], ['etl', 5], ['pipeline', 5], ['aws', 4],
        ['cloud', 3], ['data lake', 5], ['s3', 4], ['glue', 4], ['lambda', 4],
        ['spark', 4], ['airflow', 4], ['snowflake', 4], ['terraform', 3],
        ['docker', 3], ['kubernetes', 3],
      ],
      handler: () => ({
        text: `Pradeep has significant data engineering experience:\n\n- At BMSC, built a unified AWS data lake integrating 6+ enterprise systems using S3, Glue, Lambda, Step Functions, and Athena\n- Designed end-to-end ETL pipelines with strong data governance (IAM/KMS)\n- At Shree Kay Vee, deployed ETL pipelines cutting manual processing by 50%\n- Automated SQL pipelines processing 1M+ labor records\n\nTools & technologies:\nAWS (S3, Glue, Lambda, Athena, SageMaker), Apache Spark, Airflow, Snowflake, Docker, Kubernetes, Terraform, PostgreSQL, MongoDB, SQL Server\n\nHe holds AWS Cloud Architecting certification and has hands-on experience across the AWS ecosystem.`,
        followUps: ['BMSC role details', 'AWS certifications', 'All skills', 'ML expertise'],
      }),
    },

    // --- Web Development ---
    {
      name: 'web_dev',
      keywords: [
        ['web', 3], ['frontend', 4], ['backend', 4], ['full stack', 5],
        ['fullstack', 5], ['react', 5], ['node', 4], ['flask', 4],
        ['django', 4], ['fastapi', 4], ['api', 3], ['website', 3],
      ],
      handler: () => {
        const webProjects = projectsData.filter(
          (p) => p.category === 'Web Development' || p.category === 'Full-Stack'
        );

        return {
          text: `Pradeep has full-stack web development skills:\n\nFrontend: React, TypeScript, Tailwind CSS, HTML/CSS\nBackend: Node.js, Flask, Django, FastAPI\nDatabases: PostgreSQL, MongoDB, SQL Server\nDeployment: Docker, AWS, Netlify\n\n${webProjects.length > 0 ? `Web projects include:\n${webProjects.slice(0, 3).map((p) => `- ${p.title}: ${p.description.slice(0, 80)}...`).join('\n')}` : 'He applies these skills across multiple projects.'}\n\nThis very portfolio was built with React, TypeScript, Tailwind CSS, and Framer Motion!`,
          followUps: ['All projects', 'Skills breakdown', 'ML expertise', 'Contact'],
        };
      },
    },

    // --- Location / Availability ---
    {
      name: 'location',
      keywords: [
        ['location', 4], ['where', 3], ['based', 3], ['live', 3], ['city', 3],
        ['state', 2], ['country', 2], ['relocate', 4], ['remote', 3],
        ['available', 4], ['availability', 5], ['open to', 4], ['looking for', 4],
        ['hiring', 3],
      ],
      handler: () => ({
        text: `Pradeep is currently based in Atlanta, Georgia, United States.\n\nHe is currently working as a Junior Data Scientist at UPS (started Feb 2026).\n\nHe's always open to exploring new technologies, collaborations, and networking opportunities. Feel free to reach out via the Contact page!`,
        followUps: ['Contact info', 'Current role', 'Resume', 'About'],
      }),
    },

    // --- Fun / Personal ---
    {
      name: 'fun',
      keywords: [
        ['fun fact', 5], ['hobby', 4], ['hobbies', 4], ['interest', 3],
        ['free time', 4], ['outside work', 4], ['personal', 3], ['fitness', 3],
      ],
      handler: () => ({
        text: `Here are some fun facts about Pradeep:\n\n- He's a member of Equinox, showing his commitment to fitness and wellness\n- He's been a Youth Red Cross volunteer since 2019\n- He volunteered at the International Monetary Fund's Annual Summit\n- He has ${publicationsData.length} research papers published in IEEE and Springer\n- He achieved a CGPA of 9.21/10 in his undergraduate studies\n- He's proficient in ${Object.values(skillsData).flat().length}+ technologies!\n\nHe balances technical excellence with community involvement and personal wellness.`,
        followUps: ['Organizations', 'Volunteering', 'Awards', 'About'],
      }),
    },

    // --- Comparison / Why hire ---
    {
      name: 'why_hire',
      keywords: [
        ['why hire', 6], ['why should', 4], ['strength', 4], ['standout', 4],
        ['unique', 3], ['different', 3], ['special', 3], ['impressive', 3],
        ['best', 2], ['top', 2], ['strongest', 4],
      ],
      handler: () => ({
        text: `What makes Pradeep stand out:\n\n1. Full-spectrum data expertise — from raw data pipelines (AWS, ETL) to ML models (TensorFlow, PyTorch) to dashboards (Power BI, React)\n\n2. Research-backed skills — ${publicationsData.length} peer-reviewed publications in IEEE and Springer\n\n3. Industry diversity — experience across logistics (UPS), manufacturing (BMSC), education (CEAC), tech (IBM), and automation\n\n4. Academic excellence — MS from GWU (Grade: A), BE from Anna University (CGPA: 9.21/10)\n\n5. Impact-driven — built AWS data lakes integrating 6+ systems, reduced processing time by 50%, improved reporting accuracy by 25%\n\n6. Community-minded — IMF volunteer, Youth Red Cross, active in IEEE and professional organizations`,
        followUps: ['Experience', 'Projects', 'Testimonials', 'Contact'],
      }),
    },

    // --- Thank you / Goodbye ---
    {
      name: 'farewell',
      keywords: [
        ['thank', 4], ['bye', 4], ['goodbye', 4], ['see you', 4],
        ['thanks', 4], ['appreciate', 3], ['great', 2], ['helpful', 3],
      ],
      handler: () => ({
        text: `You're welcome! Thanks for exploring Pradeep's portfolio. Feel free to come back anytime if you have more questions.\n\nDon't forget to check out the Contact page if you'd like to connect with him. Have a great day!`,
        followUps: ['Contact info', 'Resume', 'LinkedIn'],
      }),
    },
  ];
}

function generateResponse(input: string): { text: string; followUps: string[] } {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      text: "It seems like you didn't type anything. Try asking about Pradeep's skills, projects, or experience!",
      followUps: ['Who is Pradeep?', 'Skills', 'Projects'],
    };
  }

  const intents = buildIntents();

  // Score all intents
  const scored = intents.map((intent) => ({
    intent,
    score: scoreIntent(trimmed, intent.keywords),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  // Require a minimum score to avoid false matches
  if (best.score >= 3) {
    return best.intent.handler();
  }

  // Check for specific project names
  const matchedProject = projectsData.find(
    (p) => trimmed.toLowerCase().includes(p.title.toLowerCase().slice(0, 15))
  );
  if (matchedProject) {
    return {
      text: `${matchedProject.title} (${matchedProject.category})\n\n${matchedProject.description}\n\nTechnologies: ${matchedProject.technologies.join(', ')}\n\n${matchedProject.githubUrl ? `GitHub: ${matchedProject.githubUrl}` : ''}`,
      followUps: ['All projects', 'Skills', 'Experience', 'Contact'],
    };
  }

  // Check for specific skill/technology queries
  const allSkills = Object.values(skillsData).flat() as string[];
  const matchedSkill = allSkills.find(
    (s) => trimmed.toLowerCase().includes(s.toLowerCase())
  );
  if (matchedSkill) {
    const category = Object.entries(skillsData).find(
      ([, skills]) => (skills as string[]).includes(matchedSkill)
    );
    const relatedProjects = projectsData.filter(
      (p) => p.technologies.some((t) => t.toLowerCase() === matchedSkill.toLowerCase())
    );

    return {
      text: `Yes! Pradeep is skilled in ${matchedSkill}.\n\nCategory: ${category ? category[0] : 'Technical Skills'}\n\n${relatedProjects.length > 0 ? `Projects using ${matchedSkill}:\n${relatedProjects.slice(0, 3).map((p) => `- ${p.title}`).join('\n')}` : `He has used ${matchedSkill} across his professional roles.`}\n\nCheck the Skills page for the full breakdown!`,
      followUps: ['All skills', 'Projects', 'Experience', 'Certifications'],
    };
  }

  // Default fallback
  return {
    text: `I'm not sure I understood that. Here are some topics I can help with:\n\n- "Who is Pradeep?" — Overview and background\n- "Experience" — Work history and roles\n- "Skills" — Technical skills and tools\n- "Projects" — Featured projects\n- "Education" — Degrees and academics\n- "Publications" — Research papers\n- "Certifications" — Professional credentials\n- "Awards" — Honors and recognitions\n- "Organizations" — Professional memberships\n- "Volunteering" — Community involvement\n- "Testimonials" — What others say\n- "Contact" — How to reach him\n- "Resume" — Download his CV\n- "Why hire Pradeep?" — What makes him stand out\n\nTry typing any of these topics!`,
    followUps: ['Who is Pradeep?', 'Experience', 'Projects', 'Skills'],
  };
}

// --- Quick question sets ---
const initialQuickQuestions = [
  'Who is Pradeep?',
  'Current role & experience',
  'Top projects',
  'Skills & certifications',
  'Education background',
  'Why hire Pradeep?',
];

export const Chatbot = () => {
  const { chatbotOpen, toggleChatbot } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm Pradeep's portfolio assistant. I can tell you about his experience, projects, skills, education, and more.\n\nTry asking me a question or pick a topic below!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatbotOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatbotOpen]);

  const handleSend = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setFollowUps([]);
    setIsTyping(true);

    // Variable typing delay based on response length
    const response = generateResponse(messageText);
    const delay = Math.min(600 + response.text.length * 2, 1500);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);
      setFollowUps(response.followUps);
    }, delay);
  }, [input, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      toggleChatbot();
    }
  };

  const showQuickQuestions = messages.length <= 2 && followUps.length === 0;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle chat"
      >
        {chatbotOpen ? (
          <HiX className="w-6 h-6" />
        ) : (
          <HiChat className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Portfolio chat assistant"
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:w-[380px] max-h-[70vh] sm:max-h-[520px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Portfolio Assistant</h3>
                <p className="text-xs opacity-80">
                  Ask me about Pradeep's work & skills
                </p>
              </div>
              <button
                onClick={toggleChatbot}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[340px]" aria-live="polite">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Follow-up suggestions */}
            {followUps.length > 0 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-2 flex flex-wrap gap-1.5"
              >
                {followUps.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Initial Quick Questions */}
            {showQuickQuestions && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {initialQuickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about skills, projects, experience..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors"
                  aria-label="Send message"
                >
                  <HiPaperAirplane className="w-4 h-4 rotate-90" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
