import { useEffect, useRef, useState } from 'react';

const brands = [
  { id: 1,  name: 'Hero MotoCorp', abbr: 'HERO',     logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Hero_MotoCorp_Logo.svg' },
  { id: 2,  name: 'Honda',         abbr: 'HONDA',    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Honda.svg' },
  { id: 3,  name: 'Bajaj Auto',    abbr: 'BAJAJ',    logo: 'https://images.seeklogo.com/logo-png/32/1/bajaj-logo-png_seeklogo-320908.png' },
  { id: 4,  name: 'TVS Motor',     abbr: 'TVS',      logo: 'https://1000logos.net/wp-content/uploads/2020/07/TVS-Motor-Logo.jpg' },
  { id: 5,  name: 'Royal Enfield', abbr: 'RE',       logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Royal_Enfield_logo_new.svg' },
  { id: 6,  name: 'Yamaha',        abbr: 'YAMAHA',   logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXfDEW1HslQ8uBLsoKZ1wY3h7IP1dLCL64ng&s' },
  { id: 7,  name: 'Suzuki',        abbr: 'SUZUKI',   logo: 'https://thumbs.dreamstime.com/b/suzuki-company-logo-motor-corporation-japanese-multinational-headquartered-minami-ku-hamamatsu-manufactures-automobiles-140090091.jpg' }
];

export default function OurDealBikes() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const Card = ({ brand, delay }) => {
    const err = imgErrors[brand.id];
    return (
      <div
        style={{
          width: 160,
          height: 120,
          background: '#fff',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: `all 0.7s ease ${delay}ms`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.04)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
        }}
      >
        {!err ? (
          <img
            src={brand.logo}
            alt={brand.name}
            onError={() => setImgErrors((p) => ({ ...p, [brand.id]: true }))}
            style={{ width: 110, height: 80, objectFit: 'contain' }}
          />
        ) : (
          <span
            style={{
              fontFamily: 'sans-serif',
              fontSize: 20,
              fontWeight: 900,
              color: '#111',
              letterSpacing: '-0.01em',
              textAlign: 'center',
              padding: '0 10px',
            }}
          >
            {brand.abbr}
          </span>
        )}
      </div>
    );
  };

  return (
    <section
      style={{
        // background: 'linear-gradient(135deg, #0f0f17 0%, #14141f 50%, #0a0a12 100%)',
        backgroundImage: 'url(/images/bg1.jpg)',
        padding: '80px 5vw',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;700;800&display=swap');
      `}</style>

      {/* Subtle dot + noise overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 1px),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")
          `,
          backgroundSize: '24px 24px, 200px 200px',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 60 }}>
        <div
          style={{
            width: 180,
            height: 3,
            background: 'linear-gradient(to right, transparent, #ffffff88, transparent)',
            margin: '0 auto 28px',
          }}
        />
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(36px, 6vw, 52px)',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          Brands We Deal In
        </h2>
      </div>

      {/* Brands grid */}
      <div
        ref={sectionRef}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 32,
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {brands.map((brand, i) => (
          <Card key={brand.id} brand={brand} delay={i * 60} />
        ))}
      </div>
    </section>
  );
}