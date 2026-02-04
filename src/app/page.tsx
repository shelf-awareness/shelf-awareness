import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shelf Awareness',
  description: 'Manage your pantry shelf, reduce food waste, and cook smarter.',
  icons: '/favicon.ico',
};

/** The Home page. */
const Home = () => (
  <main>
    <Hero />
    <Features />
  </main>
);

export default Home;
