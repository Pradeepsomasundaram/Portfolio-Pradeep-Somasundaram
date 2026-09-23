import { Layout } from './components/layout';
import { SectionDivider, TechMarquee } from './components/ui';
import {
  Hero,
  About,
  Experience,
  Education,
  Skills,
  Universe,
  Projects,
  GithubActivity,
  Certifications,
  Publications,
  Awards,
  Volunteering,
  Organizations,
  Testimonials,
  Contact,
} from './components/sections';

function App() {
  return (
    <Layout>
      <Hero />
      <About />
      <SectionDivider />
      <Experience />
      <SectionDivider />
      <Education />
      <SectionDivider />
      <Skills />
      <Universe />
      <TechMarquee />
      <Projects />
      <SectionDivider />
      <GithubActivity />
      <SectionDivider />
      <Certifications />
      <SectionDivider />
      <Publications />
      <SectionDivider />
      <Awards />
      <SectionDivider />
      <Volunteering />
      <SectionDivider />
      <Organizations />
      <SectionDivider />
      <Testimonials />
      <SectionDivider />
      <Contact />
    </Layout>
  );
}

export default App;
