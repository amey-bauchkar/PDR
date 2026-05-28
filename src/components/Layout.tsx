import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../styles/theme-crimson.css';

function useRevealOnScroll() {
  const location = useLocation();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -2% 0px', threshold: 0.02 },
    );

    const observeNewElements = () => {
      document.querySelectorAll<HTMLElement>('.reveal:not(.in)').forEach((el) => {
        // io.observe is safe to call multiple times on the same element
        io.observe(el);
      });
    };

    observeNewElements();

    const mo = new MutationObserver(() => {
      observeNewElements();
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [location.pathname]);
}

function useScrollToHashOrTop() {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname, location.hash]);
}

export default function Layout() {
  useRevealOnScroll();
  useScrollToHashOrTop();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main>
        <Outlet />
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
