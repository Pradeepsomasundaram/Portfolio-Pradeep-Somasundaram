import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Hero } from './components/sections';

// Lazy load all pages except Hero for faster initial load
const About = lazy(() => import('./components/sections/About').then(m => ({ default: m.About })));
const Experience = lazy(() => import('./components/sections/Experience').then(m => ({ default: m.Experience })));
const Education = lazy(() => import('./components/sections/Education').then(m => ({ default: m.Education })));
const Projects = lazy(() => import('./components/sections/Projects').then(m => ({ default: m.Projects })));
const ProjectDetail = lazy(() => import('./components/sections/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const Skills = lazy(() => import('./components/sections/Skills').then(m => ({ default: m.Skills })));
const Certifications = lazy(() => import('./components/sections/Certifications').then(m => ({ default: m.Certifications })));
const Publications = lazy(() => import('./components/sections/Publications').then(m => ({ default: m.Publications })));
const Volunteering = lazy(() => import('./components/sections/Volunteering').then(m => ({ default: m.Volunteering })));
const Awards = lazy(() => import('./components/sections/Awards').then(m => ({ default: m.Awards })));
const Organizations = lazy(() => import('./components/sections/Organizations').then(m => ({ default: m.Organizations })));
const Testimonials = lazy(() => import('./components/sections/Testimonials').then(m => ({ default: m.Testimonials })));
const Contact = lazy(() => import('./components/sections/Contact').then(m => ({ default: m.Contact })));
const NotFound = lazy(() => import('./components/sections/NotFound').then(m => ({ default: m.NotFound })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Hero />} />
          <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
          <Route path="/experience" element={<Suspense fallback={<PageLoader />}><Experience /></Suspense>} />
          <Route path="/education" element={<Suspense fallback={<PageLoader />}><Education /></Suspense>} />
          <Route path="/projects" element={<Suspense fallback={<PageLoader />}><Projects /></Suspense>} />
          <Route path="/projects/:id" element={<Suspense fallback={<PageLoader />}><ProjectDetail /></Suspense>} />
          <Route path="/skills" element={<Suspense fallback={<PageLoader />}><Skills /></Suspense>} />
          <Route path="/certifications" element={<Suspense fallback={<PageLoader />}><Certifications /></Suspense>} />
          <Route path="/publications" element={<Suspense fallback={<PageLoader />}><Publications /></Suspense>} />
          <Route path="/volunteering" element={<Suspense fallback={<PageLoader />}><Volunteering /></Suspense>} />
          <Route path="/awards" element={<Suspense fallback={<PageLoader />}><Awards /></Suspense>} />
          <Route path="/organizations" element={<Suspense fallback={<PageLoader />}><Organizations /></Suspense>} />
          <Route path="/testimonials" element={<Suspense fallback={<PageLoader />}><Testimonials /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
