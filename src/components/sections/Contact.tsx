import { useState } from 'react';
import { AnimatedSection, Card } from '../ui';
import { HiMail, HiLocationMarker, HiSparkles } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

const contactInfo = [
  {
    icon: HiMail,
    label: 'Email',
    value: 'aadhi1501@gmail.com',
    href: 'mailto:aadhi1501@gmail.com',
  },
  {
    icon: HiLocationMarker,
    label: 'Location',
    value: 'Atlanta, Georgia',
  },
];

const socialLinks = [
  {
    icon: FaGithub,
    label: 'GitHub',
    href: 'https://github.com/PradeepSomasundaram1512',
  },
  {
    icon: FaLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/pradeep-somasundaram-835230192/',
  },
];

export const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [polish, setPolish] = useState<{ state: 'idle' | 'working' | 'done' | 'error'; note?: string }>({ state: 'idle' });

  // Optional: rewrites the visitor's rough note into a clear message. They review
  // and edit it in the box before sending; nothing is sent automatically.
  const polishMessage = async () => {
    setPolish({ state: 'working' });
    try {
      const res = await fetch('/.netlify/functions/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, message: formData.message }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok || !data.message) {
        setPolish({ state: 'error', note: res.status === 429 ? 'Polish limit reached — you can send your message as written.' : 'AI polish is unavailable right now — you can send your message as written.' });
        return;
      }
      setFormData((f) => ({ ...f, message: data.message as string }));
      setPolish({ state: 'done', note: 'AI-polished — please review and edit before sending.' });
    } catch {
      setPolish({ state: 'error', note: 'AI polish is unavailable right now — you can send your message as written.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://formspree.io/f/meelpngz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('sent');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-12 heading-shimmer">
            Get In Touch
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-center text-gray-600 dark:text-gray-300 mb-12">
              I'm currently open to exploring new technologies and collaborations. Feel
              free to reach out if you'd like to connect!
            </p>

            {/* Contact Form */}
            <AnimatedSection delay={0.1}>
              <Card hover={false} className="mb-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 -mt-2">
                    <button
                      type="button"
                      onClick={polishMessage}
                      disabled={formData.message.trim().length < 10 || polish.state === 'working'}
                      className="inline-flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-full border border-secondary/50 text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <HiSparkles className="w-4 h-4" />
                      {polish.state === 'working' ? 'Polishing…' : 'Polish with AI'}
                    </button>
                    {polish.note && (
                      <span className={`text-xs ${polish.state === 'error' ? 'text-red-400' : 'text-secondary'}`}>{polish.note}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? 'Sending...' : 'Send Message'}
                    </button>
                    {status === 'sent' && (
                      <motion.p
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-green-400 font-medium"
                      >
                        Message sent successfully!
                      </motion.p>
                    )}
                    {status === 'error' && (
                      <motion.p
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-red-400 font-medium"
                      >
                        Failed to send. Try again.
                      </motion.p>
                    )}
                  </div>
                </form>
              </Card>
            </AnimatedSection>

            {/* Contact Info Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {contactInfo.map((item) => (
                <Card key={item.label} hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{item.value}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-8">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="p-4 bg-gray-200 dark:bg-white/10 rounded-full shadow-md">
                    <social.icon className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-medium">{social.label}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
