import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  Hero,
  About,
  Experience,
  Education,
  Projects,
  Skills,
  Certifications,
  Publications,
  Volunteering,
  Awards,
  Organizations,
  Contact,
} from './components/sections';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<About />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/education" element={<Education />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/volunteering" element={<Volunteering />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
