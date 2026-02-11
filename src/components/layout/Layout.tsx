import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Chatbot } from '../sections/Chatbot';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};
