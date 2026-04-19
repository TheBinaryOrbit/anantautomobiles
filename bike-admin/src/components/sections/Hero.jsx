import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const heroSlides = [
  {
    image: '/images/hero1.jpg',
    // title: 'ROYAL\nENFIELD',
    // sub: 'LAUNCHED',
  },
  {
    image: '/images/hero3.jpg',
    // title: 'BAJAJ\nPULSAR',
    // sub: 'LAUNCHED',
  },
  {
    image: '/images/hero2.jpg',
    // title: 'HONDA\nCB500',
    // sub: 'LAUNCHED',
  },
  {
    image: '/images/hero4.jpg',
    // title: 'KTM\nDUKE 390',
    // sub: 'LAUNCHED',
  },
];

// const BRANDS = ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM'];
const BRANDS= [
  'Shine 100',
  'Shine 125',
  'SP 125',
  'Unicorn',
  'Hornet 2.0',
  'CB350RS',
  'CB300F',
  'Activa 6G',
  'Activa 125',
  'Dio',
  'Dio 125',
  'Grazia'
];
const DURATION = 5000;
const TRANSITION_MS = 800;

export default function Hero() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [tab, setTab] = useState('new');
  const [form, setForm] = useState({ name: '', phone: '', brand: '', model: '', city: '' });
  const [mobileFormOpen, setMobileFormOpen] = useState(false);
  const transRef = useRef(false);

  useEffect(() => {
    heroSlides.forEach(s => { const img = new Image(); img.src = s.image; });
  }, []);

  const goTo = useCallback((idx) => {
    if (transRef.current || idx === current) return;
    transRef.current = true;
    setTextVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      transRef.current = false;
      setTextVisible(true);
    }, TRANSITION_MS);
  }, [current]);

  useEffect(() => {
    const t = setInterval(() => goTo((current + 1) % heroSlides.length), DURATION);
    return () => clearInterval(t);
  }, [current, goTo]);

  useEffect(() => {
    if (mobileFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFormOpen]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    alert(`Enquiry submitted!\nName: ${form.name}\nPhone: ${form.phone}\nBrand: ${form.brand}\nModel: ${form.model}\nCity: ${form.city}`);
    setMobileFormOpen(false);
  };

  const slide = heroSlides[current];

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e0e0e0',
    borderRadius: 7,
    fontSize: 13,
    fontFamily: "'Barlow', sans-serif",
    color: '#111',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const SubmitButton = () => {
    const [hovered, setHovered] = useState(false);
    return (
      <button
        type="submit"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          marginTop: 6,
          padding: '13px',
          background: hovered ? '#cc0000' : '#000',
          color: '#fff',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          border: 'none',
          borderRadius: 7,
          cursor: 'pointer',
          boxShadow: hovered ? '0 6px 20px rgba(204,0,0,0.35)' : '0 4px 14px rgba(0,0,0,0.2)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease',
          width: '100%',
        }}
      >
        Submit Enquiry →
      </button>
    );
  };

  const EnquiryForm = ({ isMobile = false }) => (
    <div style={{ width: '100%' }}>
      <h2 style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 22,
        fontWeight: 600,
        color: '#000',
        margin: `0 0 ${isMobile ? 14 : 16}px`,
        letterSpacing: '-0.02em',
      }}>
        Find Your Perfect Bike
      </h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['new'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px',
            fontSize: 13, fontWeight: 700,
            borderRadius: 6,
            border: tab === t ? 'none' : '2px solid #333',
            background: tab === t ? '#000' : 'transparent',
            color: tab === t ? '#fff' : '#222',
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: "'Barlow', sans-serif",
          }}>
            {t === 'new' ? 'New Bike' : 'Used Bike'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input name="name" value={form.name} onChange={handleChange}
          placeholder="Full Name" required style={inputStyle} />
        <input type="tel" name="phone" value={form.phone} onChange={handleChange}
          placeholder="Phone Number" required style={inputStyle} />
        <select name="brand" value={form.brand} onChange={handleChange} required
          style={{ ...inputStyle, color: form.brand ? '#111' : '#777' }}>
          <option value="" disabled>Select Models</option>
          {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="model" value={form.model} onChange={handleChange}
            placeholder="Model" style={{ ...inputStyle, width: '50%' }} />
          <input name="city" value={form.city} onChange={handleChange}
            placeholder="City" style={{ ...inputStyle, width: '50%' }} />
        </div>
        <SubmitButton />
      </form>
    </div>
  );

  return (
    <>
      {/* ─────────────── DESKTOP HERO ─────────────── */}
      <section className="desktop-hero" style={{
        position: 'relative',
        width: '100%',
        height: '82vh',
        minHeight: 480,
        maxHeight: 760,
        overflow: 'hidden',
      }}>
        {/* Background slides */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {heroSlides.map((s, i) => (
            <img key={i} src={s.image} alt="" style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              opacity: i === current ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease`,
            }} />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent 55%)',
          }} />
        </div>

        {/* Desktop content */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          padding: '66px 5vw 0',
          display: 'flex', alignItems: 'center',
          boxSizing: 'border-box',
        }}>
          {/* Form card */}
          <div style={{
            width: 340, maxWidth: '40vw', flexShrink: 0,
            padding: '24px 28px',
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 14,
            boxShadow: '0 12px 56px rgba(0,0,0,0.28)',
            boxSizing: 'border-box',
          }}>
            <EnquiryForm />
          </div>

          {/* Right: bike title (commented as in original) */}
          <div style={{ marginLeft: 'auto', textAlign: 'right', maxWidth: '50%' }}>
            <div style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? 'translateY(0)' : 'translateY(18px)',
              transition: `opacity ${TRANSITION_MS * 0.6}ms ease, transform ${TRANSITION_MS * 0.6}ms ease`,
            }}>
              {/* title + sub commented out as in your original code */}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── MOBILE HERO ─────────────── */}
      <div className="mobile-hero" style={{
        display: 'none',
        width: '100%',
        background: '#f2f2f2',
        flexDirection: 'column',
        paddingBottom: 24,
        marginTop:12,

        boxSizing: 'border-box',
      }}>

        {/* Banner wrapper */}
        <div style={{
          position: 'relative',
          width: 'calc(100% - 24px)',
          margin: '62px 12px 0',
          borderRadius: 16,
          overflow: 'hidden',
          aspectRatio: '16 / 9',
          // boxShadow: '0 6px 28px rgba(0,0,0,0.18)',
          flexShrink: 0,
        }}>
          {/* Slides */}
          {heroSlides.map((s, i) => (
            <img key={i} src={s.image} alt="" style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              opacity: i === current ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease`,
            }} />
          ))}

          {/* Updated gradient – stops earlier to protect button area */}
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '54%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.45) 32%, transparent 108%)',
            pointerEvents: 'none',
          }} />

          {/* Bottom-left: heading text – moved up */}
          <div style={{
            position: 'absolute',
            bottom: 82,  // ← increased from 46
            left: 16,
            zIndex: 5,
            opacity: textVisible ? 1 : 0,
            transform: textVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity ${TRANSITION_MS * 0.6}ms ease, transform ${TRANSITION_MS * 0.6}ms ease`,
          }}>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(20px,6vw,28px)',
              fontWeight: 900,
              lineHeight: 1,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              margin: '0 0 2px',
              whiteSpace: 'pre-line',
            }}>{slide.title}</p>
            <p style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              margin: 0,
            }}>{slide.sub}</p>
          </div>

          {/* Enquire Now button – main fix area */}
          <button
            onClick={() => setMobileFormOpen(true)}
            style={{
              position: 'absolute',
              bottom: 'calc(16px + env(safe-area-inset-bottom))',
              left: 16,
              zIndex: 10,
              padding: '11px 22px',
              background: '#d90000',
              color: '#fff',
              fontSize: 13.5,
              fontWeight: 800,
              fontFamily: "'Barlow', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 10,
              boxShadow: '0 6px 20px rgba(217,0,0,0.48)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minWidth: 140,
            }}
          >
            Enquire Now →
          </button>
        </div>

        {/* 4 Feature Cards grid – unchanged */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          padding: '14px 12px 0',
        }}>
          {[
            { label: 'New Bikes', sub: 'with Exciting Offers', bg: '#fff', color: '#111', icon: '', route: '/public-bikes' },
            { label: 'Services',  sub: 'with Exciting Offers', bg: '#111', color: '#fff', icon: '⚙️', route: '/services' },
            { label: 'Blogs',     sub: 'with Exciting Offers', bg: '#111', color: '#fff', icon: '', route: '/blogs' },
            { label: 'Offers',    sub: 'with Exciting Offers', bg: '#fff', color: '#111', icon: '', route: '/offers' },
          ].map((card, idx) => (
            <div key={idx} onClick={() => navigate(card.route)} style={{
              background: card.bg,
              borderRadius: 14,
              padding: '18px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 100,
              boxShadow: card.bg === '#fff'
                ? '0 2px 12px rgba(0,0,0,0.07), inset 0 0 0 1.5px #e8e8e8'
                : '0 2px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 18, fontWeight: 800,
                  color: card.color, margin: '0 0 2px',
                  letterSpacing: '-0.01em',
                }}>{card.label}</p>
                <p style={{
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: 10, fontWeight: 500,
                  color: card.bg === '#fff' ? '#999' : 'rgba(255,255,255,0.6)',
                  margin: 0,
                }}>{card.sub}</p>
              </div>
              <div style={{ fontSize: 28, lineHeight: 1, marginTop: 8 }}>{card.icon}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────── MOBILE OVERLAY FORM ─────────────── */}
      {mobileFormOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setMobileFormOpen(false); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div style={{
            width: '100%', background: '#fff',
            borderRadius: '20px 20px 0 0',
            padding: '0 22px 48px',
            maxHeight: '92vh', overflowY: 'auto',
            boxSizing: 'border-box',
            animation: 'slideUp 0.32s cubic-bezier(0.32,0.72,0,1)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative',
              paddingTop: 14, marginBottom: 20,
            }}>
              <div style={{ width: 40, height: 5, background: '#e0e0e0', borderRadius: 4 }} />
              <button
                onClick={() => setMobileFormOpen(false)}
                style={{
                  position: 'absolute', right: 0, top: 8,
                  width: 32, height: 32, borderRadius: '50%',
                  border: 'none', background: '#f2f2f2',
                  cursor: 'pointer', fontSize: 14, color: '#444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>
            </div>
            <EnquiryForm isMobile />
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        @media (max-width: 940px) {
          .desktop-hero { display: none !important; }
          .mobile-hero  { display: flex !important; }
        }
        @media (min-width: 941px) {
          .desktop-hero { display: block !important; }
          .mobile-hero  { display: none !important; }
        }
        .mobile-hero * { box-sizing: border-box; }
      `}</style>
    </>
  );
}