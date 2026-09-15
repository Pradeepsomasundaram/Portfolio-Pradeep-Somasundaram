import { Layout } from './components/layout';
import { SectionDivider, TechMarquee } from './components/ui';
import {
  Hero,
  About,
  Experience,
  Education,
  Skills,
  Projects,
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
      <TechMarquee />
      <Projects />
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
