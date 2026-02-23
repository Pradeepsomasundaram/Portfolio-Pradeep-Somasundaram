import { useState, useRef, useEffect } from 'react';
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

const quickQuestions = [
  'Who is Pradeep?',
  'Current role & experience',
  'Top projects',
  'Skills & certifications',
  'Education background',
  'Publications & research',
];

function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  // Greetings
  if (
    lower.match(/^(hello|hi|hey|greetings|howdy|what's up|sup)/) ||
    lower === 'hi' ||
    lower === 'hey'
  ) {
    return `Hello! Welcome to Pradeep's portfolio. I can help you learn about his professional background, projects, skills, and more.\n\nHere are some things you can ask me:\n• His current role and work experience\n• Technical skills and certifications\n• Projects he's built\n• Education and research publications\n• How to get in touch\n\nWhat would you like to know?`;
  }

  // About / Who is Pradeep
  if (
    lower.includes('who is') ||
    lower.includes('about') ||
    lower.includes('tell me') ||
    lower.includes('introduce') ||
    lower.includes('background')
  ) {
    const currentRole = experienceData[0];
    return `Pradeep Somasundaram is a Data Scientist, Data Engineer, and AI/ML Engineer based in Atlanta, Georgia.\n\nHe holds a Master of Science in Data Science from The George Washington University (Grade: A) and a Bachelor of Engineering in EEE from Anna University (CGPA: 9.21/10).\n\nCurrently, he works as a ${currentRole.role} at ${currentRole.company}, where he ${currentRole.achievements[0].toLowerCase()}.\n\nWith ${aboutData.stats.yearsExperience} years of experience, ${projectsData.length}+ projects, and expertise in ${Object.values(skillsData).flat().length}+ technologies, he brings a strong blend of data engineering, machine learning, and full-stack development skills.\n\nVisit the About page to learn more!`;
  }

  // Current role / Experience
  if (
    lower.includes('experience') ||
    lower.includes('work') ||
    lower.includes('job') ||
    lower.includes('current role') ||
    lower.includes('career') ||
    lower.includes('company') ||
    lower.includes('ups') ||
    lower.includes('bmsc') ||
    lower.includes('where does he work')
  ) {
    const expSummary = experienceData
      .slice(0, 3)
      .map((exp) => {
        const tag = exp.featured ? ' (Current)' : '';
        return `• ${exp.role} at ${exp.company}${tag}\n  ${exp.dateRange} | ${exp.location}\n  ${exp.achievements[0]}`;
      })
      .join('\n\n');

    return `Pradeep has ${experienceData.length} professional roles spanning data science, data engineering, AI/ML, and IoT. Here are his most recent positions:\n\n${expSummary}\n\nHe has worked across industries including logistics (UPS), manufacturing (BMSC), consulting (CEAC), and technology (IBM, KaaShiv InfoTech).\n\nVisit the Experience page for the complete timeline!`;
  }

  // Skills
  if (
    lower.includes('skill') ||
    lower.includes('technolog') ||
    lower.includes('what can he do') ||
    lower.includes('stack') ||
    lower.includes('tools') ||
    lower.includes('programming')
  ) {
    const categories = Object.entries(skillsData);
    const summary = categories
      .slice(0, 6)
      .map(
        ([cat, skills]) =>
          `• ${cat}: ${(skills as string[]).slice(0, 4).join(', ')}${(skills as string[]).length > 4 ? ` +${(skills as string[]).length - 4} more` : ''}`
      )
      .join('\n');

    const totalSkills = Object.values(skillsData).flat().length;

    return `Pradeep is proficient in ${totalSkills}+ technologies across ${categories.length} categories:\n\n${summary}\n\n...and ${categories.length - 6} more categories!\n\nHe also holds ${certificationsData.length} certifications including "${certificationsData[0].name}" from ${certificationsData[0].issuer}.\n\nCheck the Skills and Certifications pages for the full breakdown!`;
  }

  // Projects
  if (
    lower.includes('project') ||
    lower.includes('portfolio') ||
    lower.includes('built') ||
    lower.includes('created') ||
    lower.includes('developed')
  ) {
    const featured = projectsData.filter((p) => p.featured);
    const categories = [...new Set(projectsData.map((p) => p.category))];

    const summary = featured
      .slice(0, 4)
      .map(
        (p) =>
          `• ${p.title} (${p.category})\n  ${p.description.slice(0, 100)}...`
      )
      .join('\n\n');

    return `Pradeep has built ${projectsData.length}+ projects spanning ${categories.join(', ')}.\n\nFeatured projects:\n\n${summary}\n\nProjects range from deep learning models and NLP systems to full-stack web apps and IoT platforms.\n\nExplore the Projects page to see them all with filters and search!`;
  }

  // Education
  if (
    lower.includes('education') ||
    lower.includes('university') ||
    lower.includes('degree') ||
    lower.includes('college') ||
    lower.includes('school') ||
    lower.includes('study') ||
    lower.includes('graduated') ||
    lower.includes('gpa')
  ) {
    const eduSummary = educationData
      .map(
        (edu) =>
          `• ${edu.degree} in ${edu.field}\n  ${edu.institution} (${edu.dateRange})\n  Grade: ${edu.grade} | ${edu.location}\n  Activities: ${edu.activities}`
      )
      .join('\n\n');

    return `Pradeep's educational background:\n\n${eduSummary}\n\nHis coursework covered advanced machine learning, deep learning, NLP, cloud computing, big data analytics, and statistical modeling.\n\nVisit the Education page for more details!`;
  }

  // Certifications
  if (
    lower.includes('certif') ||
    lower.includes('credential') ||
    lower.includes('certified')
  ) {
    const certSummary = certificationsData
      .map((cert) => `• ${cert.name} — ${cert.issuer} (${cert.date})`)
      .join('\n');

    return `Pradeep holds ${certificationsData.length} professional certifications:\n\n${certSummary}\n\nThese certifications validate his expertise across data science, cloud computing, IoT, and Python programming.\n\nSee the Certifications page for full details!`;
  }

  // Publications / Research
  if (
    lower.includes('publication') ||
    lower.includes('research') ||
    lower.includes('paper') ||
    lower.includes('ieee') ||
    lower.includes('springer')
  ) {
    const pubSummary = publicationsData
      .map(
        (pub) =>
          `• "${pub.title}"\n  Published in ${pub.publisher} (${pub.date}) — ${pub.type}\n  ${pub.description.slice(0, 120)}...`
      )
      .join('\n\n');

    return `Pradeep has ${publicationsData.length} peer-reviewed publications:\n\n${pubSummary}\n\nHis research spans deep learning for manufacturing quality control and machine learning for biomedical signal processing.\n\nVisit the Publications page to learn more!`;
  }

  // Awards
  if (
    lower.includes('award') ||
    lower.includes('honor') ||
    lower.includes('achievement') ||
    lower.includes('recognition')
  ) {
    const awardSummary = awardsData
      .map((a) => `• ${a.title} — ${a.issuer} (${a.date})`)
      .join('\n');

    return `Pradeep's honors and awards:\n\n${awardSummary}\n\nThese recognize his contributions to international policy forums, community service, technical symposiums, and academic excellence.\n\nCheck out the Awards page for details!`;
  }

  // Volunteering
  if (
    lower.includes('volunteer') ||
    lower.includes('community') ||
    lower.includes('imf') ||
    lower.includes('red cross')
  ) {
    const volSummary = volunteeringData
      .map(
        (v) =>
          `• ${v.role} at ${v.organization} (${v.dateRange})\n  ${v.description.slice(0, 100)}...`
      )
      .join('\n\n');

    return `Pradeep actively gives back through volunteering:\n\n${volSummary}\n\nHis volunteer work reflects his commitment to economic empowerment, humanitarian aid, and advancing STEM education.\n\nVisit the Volunteering page to learn more!`;
  }

  // Contact
  if (
    lower.includes('contact') ||
    lower.includes('email') ||
    lower.includes('reach') ||
    lower.includes('hire') ||
    lower.includes('connect') ||
    lower.includes('linkedin') ||
    lower.includes('github')
  ) {
    return `You can connect with Pradeep through:\n\n📧 Email: ${aboutData.social.email}\n🔗 LinkedIn: linkedin.com/in/pradeep-somasundaram-835230192\n💻 GitHub: github.com/PradeepSomasundaram1512\n📍 Location: Atlanta, Georgia\n\nHe's currently open to exploring new technologies and collaborations. Head to the Contact page to reach out!`;
  }

  // Resume
  if (
    lower.includes('resume') ||
    lower.includes('cv') ||
    lower.includes('download')
  ) {
    return `You can download Pradeep's resume by clicking the "Download Resume" button on the Home page. It includes his complete professional background, skills, and experience.\n\nThe resume covers his work at UPS, BMSC, CEAC, and other roles, along with his MS in Data Science from GWU.`;
  }

  // ML / AI specific
  if (
    lower.includes('machine learning') ||
    lower.includes(' ai') ||
    lower.includes('deep learning') ||
    lower.includes('nlp') ||
    lower.includes('artificial intelligence')
  ) {
    const mlProjects = projectsData.filter(
      (p) =>
        p.category === 'Machine Learning' ||
        p.category === 'AI/NLP' ||
        p.category === 'Deep Learning'
    );

    return `Pradeep has strong expertise in AI/ML:\n\n🔬 ${mlProjects.length}+ ML/AI projects including deep learning, NLP, and computer vision\n📝 ${publicationsData.length} research publications (IEEE, Springer)\n🎓 MS in Data Science from GWU with focus on ML\n🏅 Certified Data Scientist (micro1)\n\nKey technologies: Python, TensorFlow, PyTorch, Scikit-learn, Hugging Face, OpenAI APIs, LangChain\n\nHis work includes semiconductor defect classification, emotion detection from ECG signals, and building scalable ML pipelines.\n\nExplore his Projects page for the full ML portfolio!`;
  }

  // Data Engineering specific
  if (
    lower.includes('data engineer') ||
    lower.includes('etl') ||
    lower.includes('pipeline') ||
    lower.includes('aws') ||
    lower.includes('cloud')
  ) {
    return `Pradeep has significant data engineering experience:\n\n☁️ At BMSC, he built a unified AWS data lake integrating 6+ enterprise systems using S3, Glue, Lambda, Step Functions, and Athena\n🔄 Designed end-to-end ETL pipelines with strong data governance (IAM/KMS)\n📊 Experience with SQL Server, PostgreSQL, MongoDB, and cloud-native architectures\n🔧 Tools: Apache Spark, Airflow, dbt, Docker, Kubernetes, Terraform\n\nHe holds AWS Cloud Practitioner certification and has hands-on experience across the AWS ecosystem.\n\nCheck the Experience and Skills pages for more!`;
  }

  // Thank you / bye
  if (
    lower.includes('thank') ||
    lower.includes('bye') ||
    lower.includes('goodbye') ||
    lower.includes('see you')
  ) {
    return `You're welcome! Thanks for exploring Pradeep's portfolio. Feel free to come back anytime if you have more questions.\n\nDon't forget to check out the Contact page if you'd like to connect with him. Have a great day!`;
  }

  // Default fallback
  return `I'd be happy to help you learn about Pradeep! Here are some topics I can assist with:\n\n🧑‍💼 "Current role" — His work experience and career\n🛠️ "Skills" — Technical skills and certifications\n📂 "Projects" — Featured projects and portfolio\n🎓 "Education" — Degrees and academic background\n📝 "Publications" — Research papers and contributions\n🏆 "Awards" — Honors and recognitions\n🤝 "Volunteering" — Community involvement\n📧 "Contact" — How to reach him\n📄 "Resume" — Download his resume\n\nJust type a topic or ask a question!`;
}

export const Chatbot = () => {
  const { chatbotOpen, toggleChatbot } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to Pradeep's portfolio! I'm here to help you learn about his experience, projects, skills, and more.\n\nTry asking me something, or pick a topic below to get started.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(messageText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      toggleChatbot();
    }
  };

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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
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
                <div
                  key={msg.id}
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
                </div>
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

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickQuestions.map((q) => (
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
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about skills, projects, experience..."
                  className="flex-1 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
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
