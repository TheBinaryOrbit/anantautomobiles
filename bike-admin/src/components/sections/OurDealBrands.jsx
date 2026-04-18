import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const bikes = [
  {
    id: 1,
    name: 'Splendor Plus',
    price: '₹75,000*',
    img: 'https://mrgmotors.com/wp-content/uploads/2022/01/splendor-plus-ibs-i3s-21-removebg-preview.png'
  },
  {
    id: 2,
    name: 'HF Deluxe',
    price: '₹60,000*',
    img: 'https://imgd.aeplcdn.com/370x208/n/cw/ec/212719/hf-deluxe-right-side-view-2.png?isig=0&q=100'
  },
  {
    id: 3,
    name: 'Xtreme 125R',
    price: '₹95,000*',
    img: 'https://www.heromotocorp.com/content/dam/hero-commerce/in/en/products/performance/xtreme-125r/HXTRSASSCFIBPR/360/2.png'
  },
  {
    id: 4,
    name: 'Glamour',
    price: '₹85,000*',
    img: 'https://bikebazardelhi.com/uploads/vehicle/4545-removebg-preview.png'
  }
];

export default function OurDealBikes() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

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

  const Card = ({ bike, delay }) => {
    return (
      <div
        style={{
          width: 240,
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          textAlign: 'center',
          boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: `all 0.7s ease ${delay}ms`,
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) scale(1.04)';
          e.currentTarget.style.boxShadow =
            '0 12px 32px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow =
            '0 6px 16px rgba(0,0,0,0.25)';
        }}
      >
        <img
          src={bike.img}
          alt={bike.name}
          style={{
            width: '100%',
            height: 130,
            objectFit: 'contain'
          }}
        />

        <h3 style={{ margin: '12px 0 6px', color: '#111' }}>
          {bike.name}
        </h3>

        <p
          style={{
            margin: 0,
            fontWeight: 'bold',
            color: '#e11d48',
            fontSize: 16
          }}
        >
          {bike.price}
        </p>

        <button
          onClick={() => {
            navigate('/', { replace: false });
            setTimeout(() => {
              const element = document.getElementById('book-your-dream-bike');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          style={{
            marginTop: 12,
            padding: '10px 14px',
            borderRadius: 8,
            border: 'none',
            background: '#e11d48',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Book Test Ride
        </button>
      </div>
    );
  };

  return (
    <section
      style={{
        backgroundImage: 'url(/images/bg1.jpg)',
        padding: '80px 5vw',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;700;800&display=swap');
      `}</style>

      {/* Background overlay */}
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
          mixBlendMode: 'screen'
        }}
      />

      {/* Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          marginBottom: 60
        }}
      >
        <div
          style={{
            width: 180,
            height: 3,
            background:
              'linear-gradient(to right, transparent, #ffffff88, transparent)',
            margin: '0 auto 28px'
          }}
        />

        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(36px, 6vw, 52px)',
            fontWeight: 900,
            margin: 0,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          Explore Hero Bikes
        </h2>

        <p style={{ opacity: 0.7, marginTop: 10 }}>
          Authorized Hero MotoCorp Dealer
        </p>
      </div>

      {/* Bikes Grid */}
      <div
        ref={sectionRef}
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 32,
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >
        {bikes.map((bike, i) => (
          <Card key={bike.id} bike={bike} delay={i * 80} />
        ))}
      </div>
    </section>
  );
}