import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    id: 1,
    title: 'Browse',
    desc: 'Browse big, ride bigger. Find your dream bike effortlessly and start living the dream.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Deal',
    desc: "Don't just dream it, deal it! Score big savings on your dream bike today and ride off with confidence.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <path d="M12 18h.01"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Ride',
    desc: 'Fuel your passion for riding and cruise away with your dream bike making every mile memorable.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <path d="M15 6h-3l-2 6h8l-3-6z"/>
        <path d="M9 13l-4 4.5"/>
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{
      background: '#f0f0f0',
      padding: '72px 5vw 80px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 64 }}>

        {/* "Why Choose Us" with side lines */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 14,
          marginBottom: 18,
        }}>
          <div style={{ width: 36, height: 1.5, background: '#333' }} />
          <span style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: 15, fontWeight: 600,
            color: '#333', letterSpacing: '0.04em',
          }}>Why Choose Us</span>
          <div style={{ width: 36, height: 1.5, background: '#333' }} />
        </div>

        {/* Main heading */}
        <h2 style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800,
          color: '#111',
          margin: '0 0 16px',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          Experience the Difference
        </h2>

        {/* Subtext */}
        <p style={{
          fontFamily: "'Barlow', sans-serif",
          fontSize: 16, fontWeight: 600,
          color: '#999', margin: 0,
          letterSpacing: '0.01em',
        }}>
          Buy your dream bike in just three easy steps
        </p>
      </div>

      {/* ── 3 Steps ── */}
      <div
        ref={sectionRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(32px, 8vw, 100px)',
          flexWrap: 'wrap',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: 280,
              flex: '1 1 200px',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(28px)',
              transition: `opacity 0.6s ease ${i * 120}ms, transform 0.6s ease ${i * 120}ms`,
            }}
          >
            {/* Black square icon box */}
            <div style={{
              width: 80, height: 80,
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              flexShrink: 0,
            }}>
              {step.icon}
            </div>

            {/* Title */}
            <h3 style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 18, fontWeight: 800,
              color: '#111', margin: '0 0 14px',
              letterSpacing: '-0.01em',
            }}>
              {step.title}
            </h3>

            {/* Desc */}
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: 14, fontWeight: 500,
              color: '#999', margin: 0,
              lineHeight: 1.75,
            }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}