import { Layout } from './components/layout';
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
      <Experience />
      <Education />
      <Skills />
      <Projects />
      <Certifications />
      <Publications />
      <Awards />
      <Volunteering />
      <Organizations />
      <Testimonials />
      <Contact />
    </Layout>
  );
}

export default App;
