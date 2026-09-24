import aboutData from '../data/about.json';
import projectsData from '../data/projects.json';
import skillsData from '../data/skills.json';
import experienceData from '../data/experience.json';
import educationData from '../data/education.json';
import certificationsData from '../data/certifications.json';
import publicationsData from '../data/publications.json';
import volunteeringData from '../data/volunteering.json';
import awardsData from '../data/awards.json';
import organizationsData from '../data/organizations.json';
import testimonialsData from '../data/testimonials.json';

export interface AssistantResponse {
  text: string;
  followUps: string[];
}

interface Intent {
  name: string;
  keywords: [string, number][];
  handler: () => AssistantResponse;
}

function scoreIntent(input: string, keywords: [string, number][]): number {
  const lower = input.toLowerCase();
  let score = 0;
  for (const [keyword, weight] of keywords) {
    if (lower.includes(keyword)) {
      score += weight;
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
          text: `Pradeep has ${experienceData.length} professional roles spanning data science, data engineering, AI/ML, and IoT:\n\n${expSummary}\n\nHe has worked across industries including technology services (Cognizant), manufacturing (BMSC), education (CEAC), consulting (IBM), and automation (Shree Kay Vee).`,
          followUps: ['Cognizant role details', 'BMSC role details', 'Skills overview', 'Projects'],
        };
      },
    },

    // --- Cognizant specific ---
    {
      name: 'cognizant',
      keywords: [
        ['cognizant', 6], ['current job', 5], ['current company', 5], ['agentic', 5],
        ['mlops', 5], ['atlanta', 2],
      ],
      handler: () => {
        const cog = experienceData.find((e) => e.company === 'Cognizant')!;
        return {
          text: `Pradeep currently works as a ${cog.role} at ${cog.company} (${cog.dateRange}).\n\nLocation: ${cog.location}\nType: ${cog.type}\n\n${cog.description}\n\nKey focus areas:\n${cog.achievements.map((a) => `- ${a}`).join('\n')}\n\nTechnologies: ${cog.technologies.join(', ')}`,
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
          followUps: ['Current role at Cognizant', 'Data engineering skills', 'AWS experience', 'All experience'],
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
          text: `Pradeep has full-stack web development skills:\n\nFrontend: React, TypeScript, Tailwind CSS, HTML/CSS\nBackend: Node.js, Flask, Django, FastAPI\nDatabases: PostgreSQL, MongoDB, SQL Server\nDeployment: Docker, AWS, Netlify\n\n${webProjects.length > 0 ? `Web projects include:\n${webProjects.slice(0, 3).map((p) => `- ${p.title}: ${p.description.slice(0, 80)}...`).join('\n')}` : 'He applies these skills across multiple projects.'}\n\nThis very portfolio was built with React, TypeScript, Tailwind CSS, and Framer Motion — with an on-page AI assistant woven throughout!`,
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
        text: `Pradeep is currently based in Atlanta, Georgia, United States.\n\nHe is currently working as a Agentic AI & MLOps Lead at Cognizant (since Feb 2026).\n\nHe's always open to exploring new technologies, collaborations, and networking opportunities. Feel free to reach out via the Contact page!`,
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
        text: `What makes Pradeep stand out:\n\n1. Full-spectrum data expertise — from raw data pipelines (AWS, ETL) to ML models (TensorFlow, PyTorch) to dashboards (Power BI, React)\n\n2. Research-backed skills — ${publicationsData.length} peer-reviewed publications in IEEE and Springer\n\n3. Industry diversity — experience across technology services (Cognizant), manufacturing (BMSC), education (CEAC), tech (IBM), and automation\n\n4. Academic excellence — MS from GWU (Grade: A), BE from Anna University (CGPA: 9.21/10)\n\n5. Impact-driven — built AWS data lakes integrating 6+ systems, reduced processing time by 50%, improved reporting accuracy by 25%\n\n6. Community-minded — IMF volunteer, Youth Red Cross, active in IEEE and professional organizations`,
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

export function generateResponse(input: string): AssistantResponse {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      text: "It seems like you didn't type anything. Try asking about Pradeep's skills, projects, or experience!",
      followUps: ['Who is Pradeep?', 'Skills', 'Projects'],
    };
  }

  const intents = buildIntents();

  const scored = intents.map((intent) => ({
    intent,
    score: scoreIntent(trimmed, intent.keywords),
  }));

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (best.score >= 3) {
    return best.intent.handler();
  }

  const matchedProject = projectsData.find(
    (p) => trimmed.toLowerCase().includes(p.title.toLowerCase().slice(0, 15))
  );
  if (matchedProject) {
    return {
      text: `${matchedProject.title} (${matchedProject.category})\n\n${matchedProject.description}\n\nTechnologies: ${matchedProject.technologies.join(', ')}\n\n${matchedProject.githubUrl ? `GitHub: ${matchedProject.githubUrl}` : ''}`,
      followUps: ['All projects', 'Skills', 'Experience', 'Contact'],
    };
  }

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

  return {
    text: `I'm not sure I understood that. Here are some topics I can help with:\n\n- "Who is Pradeep?" — Overview and background\n- "Experience" — Work history and roles\n- "Skills" — Technical skills and tools\n- "Projects" — Featured projects\n- "Education" — Degrees and academics\n- "Publications" — Research papers\n- "Certifications" — Professional credentials\n- "Awards" — Honors and recognitions\n- "Organizations" — Professional memberships\n- "Volunteering" — Community involvement\n- "Testimonials" — What others say\n- "Contact" — How to reach him\n- "Resume" — Download his CV\n- "Why hire Pradeep?" — What makes him stand out\n\nTry typing any of these topics!`,
    followUps: ['Who is Pradeep?', 'Experience', 'Projects', 'Skills'],
  };
}

export const initialQuickQuestions = [
  'Who is Pradeep?',
  'Current role & experience',
  'Top projects',
  'Skills & certifications',
  'Education background',
  'Why hire Pradeep?',
];

export interface CommandResult {
  id: string;
  label: string;
  sublabel?: string;
  to: string;
}

const navigablePages: CommandResult[] = [
  { id: 'hero', label: 'Home', sublabel: 'Landing page', to: '#hero' },
  { id: 'about', label: 'About', sublabel: 'Background & bio', to: '#about' },
  { id: 'experience', label: 'Experience', sublabel: 'Work history', to: '#experience' },
  { id: 'education', label: 'Education', sublabel: 'Degrees & academics', to: '#education' },
  { id: 'universe', label: 'The Toolkit', sublabel: '3D tool universe', to: '#universe' },
  { id: 'projects', label: 'Projects', sublabel: 'Featured work', to: '#projects' },
  { id: 'skills', label: 'Skills', sublabel: 'Tech stack', to: '#skills' },
  { id: 'github', label: 'GitHub', sublabel: 'Live activity', to: '#github' },
  { id: 'certifications', label: 'Certifications', sublabel: 'Credentials', to: '#certifications' },
  { id: 'publications', label: 'Publications', sublabel: 'Research papers', to: '#publications' },
  { id: 'awards', label: 'Awards', sublabel: 'Honors & recognition', to: '#awards' },
  { id: 'volunteering', label: 'Volunteering', sublabel: 'Community work', to: '#volunteering' },
  { id: 'organizations', label: 'Organizations', sublabel: 'Memberships', to: '#organizations' },
  { id: 'testimonials', label: 'Testimonials', sublabel: 'What others say', to: '#testimonials' },
  { id: 'contact', label: 'Contact', sublabel: 'Get in touch', to: '#contact' },
];

export function searchPages(query: string): CommandResult[] {
  const lower = query.trim().toLowerCase();
  if (!lower) return navigablePages;
  return navigablePages.filter(
    (p) =>
      p.label.toLowerCase().includes(lower) ||
      (p.sublabel && p.sublabel.toLowerCase().includes(lower))
  );
}

// --- Job description matcher ---
// A broader vocabulary than Pradeep's own skill list, so requirements he
// *doesn't* have show up as genuine gaps rather than the list just being a
// mirror of his resume.
const jdVocabulary = [
  'Python', 'SQL', 'Java', 'C++', 'JavaScript', 'TypeScript', 'R', 'HTML', 'CSS', 'Dart', 'Scala', 'Go', 'Kotlin', 'Swift', 'PHP', 'Ruby',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'XGBoost', 'LightGBM',
  'BERT', 'Transformers', 'GPT', 'LLM', 'LangChain', 'Generative AI', 'RAG', 'Prompt Engineering', 'Hugging Face', 'MLOps',
  'MLflow', 'Feature Engineering', 'A/B Testing', 'Time Series Analysis', 'Forecasting', 'Anomaly Detection', 'Recommendation Systems',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'Spark', 'Hadoop', 'Airflow', 'Kafka', 'Snowflake', 'Databricks',
  'Redshift', 'BigQuery', 'ETL', 'Data Pipeline', 'Data Lake', 'Data Warehouse', 'Big Data', 'S3', 'Lambda',
  'Power BI', 'Tableau', 'Excel', 'Statistics', 'Data Visualization', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly',
  'React', 'Node.js', 'Django', 'Flask', 'FastAPI', 'REST API', 'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Next.js', 'Vue', 'Angular', 'Microservices',
  'Git', 'CI/CD', 'Agile', 'Scrum', 'Linux', 'Jenkins', 'JIRA',
];

// JD phrasing that doesn't literally match how a skill is stored in skills.json
const jdEquivalences: Record<string, string> = {
  spark: 'apache spark',
  kafka: 'apache kafka',
  s3: 'aws s3',
  lambda: 'aws lambda',
  'rest api': 'rest apis',
  llm: 'llms',
  statistics: 'statistical analysis',
  'scikit-learn': 'scikit-learn',
};

function keywordAppears(originalText: string, lowerText: string, keyword: string): boolean {
  const hasSpecialChars = /[^a-z0-9\s]/i.test(keyword);
  const lowerKw = keyword.toLowerCase();
  if (hasSpecialChars) {
    return lowerText.includes(lowerKw);
  }
  // Very short tokens (e.g. "R", "Go") are matched case-sensitively against
  // the original text to avoid matching inside ordinary words like "your".
  if (keyword.length <= 2) {
    return new RegExp(`\\b${keyword}\\b`).test(originalText);
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(lowerText);
}

/** Pulls the technical requirements out of a job description and splits them
 * into what Pradeep's listed skills cover and what they don't. */
export function analyzeJobDescription(jdText: string): { detected: string[]; matched: string[]; missing: string[] } {
  const trimmed = jdText.trim();
  const lower = trimmed.toLowerCase();
  const hasSkill = new Set(Object.values(skillsData).flat().map((s) => s.toLowerCase()));
  const detected = jdVocabulary.filter((term) => keywordAppears(trimmed, lower, term));
  const matched = detected.filter(
    (term) => hasSkill.has(term.toLowerCase()) || hasSkill.has(jdEquivalences[term.toLowerCase()] ?? '')
  );
  return { detected, matched, missing: detected.filter((term) => !matched.includes(term)) };
}

export function matchJobDescription(jdText: string): AssistantResponse {
  const trimmed = jdText.trim();

  if (trimmed.length < 30) {
    return {
      text: `That's pretty short for a job description. Paste the full listing — or at least the requirements/qualifications section — and I'll break down how well Pradeep matches it.`,
      followUps: ['Match a job description', 'Skills overview', 'Top projects'],
    };
  }

  const { detected, matched, missing } = analyzeJobDescription(trimmed);

  if (detected.length === 0) {
    return {
      text: `I couldn't pick out specific technical requirements from that text. Try pasting the "Requirements" or "Qualifications" section directly — or ask me about Pradeep's skills and I'll walk you through them.`,
      followUps: ['Skills overview', 'Top projects', 'ML/AI expertise'],
    };
  }

  const score = Math.round((matched.length / detected.length) * 100);

  const scoredProjects = projectsData
    .map((p) => {
      const techLower = p.technologies.map((t) => t.toLowerCase());
      const overlap = matched.filter((m) => techLower.includes(m.toLowerCase())).length;
      return { project: p, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 3);

  const scoredExperience = experienceData
    .map((exp) => {
      const skillsLower = exp.skills.map((s) => s.toLowerCase());
      const overlap = matched.filter((m) => skillsLower.includes(m.toLowerCase())).length;
      return { exp, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 2);

  const verdict =
    score >= 70 ? 'a strong match' : score >= 45 ? 'a solid partial match' : 'a partial match worth a closer look';

  const lines: string[] = [
    `I ran this against Pradeep's profile — he's ${verdict} for this role, matching ${matched.length} of ${detected.length} requirements I detected (${score}%).`,
    '',
    `Matched: ${matched.join(', ')}`,
  ];

  if (missing.length > 0) {
    lines.push(`Not in his listed skills: ${missing.join(', ')} — though related experience may still transfer.`);
  }

  if (scoredExperience.length > 0) {
    lines.push('', 'Most relevant experience:');
    scoredExperience.forEach(({ exp }) => {
      lines.push(`- ${exp.role} at ${exp.company}: ${exp.achievements[0]}`);
    });
  }

  if (scoredProjects.length > 0) {
    lines.push('', 'Most relevant projects:');
    scoredProjects.forEach(({ project }) => {
      lines.push(`- ${project.title}: ${project.description.slice(0, 110)}...`);
    });
  }

  lines.push(
    '',
    score >= 60
      ? "Worth reaching out — this looks like a genuinely good fit."
      : "Might be a stretch on paper, but his range across data engineering, ML, and full-stack work often covers gaps that don't show up as exact keyword matches."
  );

  return {
    text: lines.join('\n'),
    followUps: ['Contact info', 'Resume', 'Top projects', 'Match another job description'],
  };
}
