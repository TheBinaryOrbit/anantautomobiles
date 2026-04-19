import { useState, useEffect, useRef } from 'react';

const offers = [
  {
    id: 1,
    type: 'exchange',
    title: 'Exchange Offer',
    headline: 'Upgrade Your Old Bike',
    desc: 'Get up to ₹8,000 extra on your old bike when you exchange for a new Hero. Valid on select models.',
    saving: '₹8,000',
    savingLabel: 'Extra Exchange Bonus',
    badge: 'Most Popular',
    badgeColor: '#FF0000',
    bg: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)',
    accent: '#FF0000',
    validity: 'Valid till 30 Apr 2025',
    terms: ['Valid on Splendor Plus, Glamour, Xtreme 125R', 'Old bike min 2015 model', 'Subject to inspection', 'T&C apply'],
    emoji: '🔄',
    bikes: ['Splendor Plus', 'Glamour', 'Xtreme 125R'],
  },
  {
    id: 2,
    type: 'finance',
    title: 'Zero Down Payment',
    headline: '0% Down Payment — Ride Today',
    desc: 'Book your Hero bike with zero down payment. Instant loan approval in just 10 minutes with minimum documents.',
    saving: '₹0',
    savingLabel: 'Down Payment Required',
    badge: 'Limited Time',
    badgeColor: '#FF6600',
    bg: 'linear-gradient(135deg, #fff8f0 0%, #fff 100%)',
    accent: '#FF6600',
    validity: 'Valid till 15 May 2025',
    terms: ['Applicable on all Hero models', 'Salaried / Self-employed eligible', 'CIBIL 650+ required', 'T&C apply'],
    emoji: '💰',
    bikes: ['All Models'],
  },
  {
    id: 3,
    type: 'cashback',
    title: 'Festival Cashback',
    headline: '₹5,000 Direct Cashback',
    desc: 'Get ₹5,000 cashback directly in your account on purchase of any Hero bike above ₹85,000 this season.',
    saving: '₹5,000',
    savingLabel: 'Direct Cashback',
    badge: 'Festival Special',
    badgeColor: '#00AA44',
    bg: 'linear-gradient(135deg, #f0fff5 0%, #fff 100%)',
    accent: '#00AA44',
    validity: 'Valid till 30 Apr 2025',
    terms: ['Bikes above ₹85,000 ex-showroom only', 'Cashback within 7 working days', 'One offer per customer', 'T&C apply'],
    emoji: '🎉',
    bikes: ['Mavrick 440', 'Xtreme 125R', 'Glamour'],
  },
  {
    id: 4,
    type: 'insurance',
    title: 'Free Insurance',
    headline: '1-Year Free Insurance',
    desc: 'Get complimentary 1st year comprehensive insurance on all new Hero bike purchases. Save up to ₹3,500.',
    saving: '₹3,500',
    savingLabel: 'Insurance Value',
    badge: 'Free Add-on',
    badgeColor: '#0055CC',
    bg: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)',
    accent: '#0055CC',
    validity: 'Ongoing Offer',
    terms: ['All new Hero bikes eligible', 'Comprehensive insurance cover', 'IDV based on model price', 'T&C apply'],
    emoji: '🛡️',
    bikes: ['All New Models'],
  },
  {
    id: 5,
    type: 'service',
    title: 'Free Service Package',
    headline: '3 Free Services + AMC',
    desc: 'Buy any Hero bike and get 3 free services (up to 3,000 km each) + Annual Maintenance Contract worth ₹2,000.',
    saving: '₹4,500',
    savingLabel: 'Service Value',
    badge: 'Value Pack',
    badgeColor: '#8800CC',
    bg: 'linear-gradient(135deg, #faf0ff 0%, #fff 100%)',
    accent: '#8800CC',
    validity: 'Valid till 31 May 2025',
    terms: ['3 free services valid for 1 year', 'Each service up to 3,000 km', 'AMC includes 2 paid services', 'T&C apply'],
    emoji: '🔧',
    bikes: ['All Models'],
  },
  {
    id: 6,
    type: 'referral',
    title: 'Refer & Earn',
    headline: 'Earn ₹1,500 Per Referral',
    desc: 'Refer a friend who buys a Hero bike from us and earn ₹1,500 cash reward. No limit on referrals!',
    saving: '₹1,500',
    savingLabel: 'Per Referral Earned',
    badge: 'Ongoing',
    badgeColor: '#CC0066',
    bg: 'linear-gradient(135deg, #fff0f8 0%, #fff 100%)',
    accent: '#CC0066',
    validity: 'Ongoing Program',
    terms: ['Friend must purchase within 30 days', 'Reward credited after delivery', 'Valid for existing customers only', 'T&C apply'],
    emoji: '👥',
    bikes: ['All Models'],
  },
];

const offerTypes = ['All', 'exchange', 'finance', 'cashback', 'insurance', 'service', 'referral'];
const typeLabels = { exchange: 'Exchange', finance: 'Finance', cashback: 'Cashback', insurance: 'Insurance', service: 'Service', referral: 'Referral' };

function OfferCard({ offer, index }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const scrollToBook = () => {
    const el = document.getElementById('book-your-dream-bike');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.location.href = '/#book-your-dream-bike';
  };

  return (
    <div ref={ref} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      background: '#fff',
      borderRadius: 18,
      overflow: 'hidden',
      border: hov ? `1.5px solid ${offer.accent}` : '1.5px solid #eee',
      boxShadow: hov ? `0 20px 52px rgba(0,0,0,0.10)` : '0 4px 20px rgba(0,0,0,0.05)',
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms, box-shadow 0.28s ease, border-color 0.28s ease`,
    }}>
      {/* Gradient top */}
      <div style={{ background: offer.bg, padding: '28px 26px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 44, lineHeight: 1 }}>{offer.emoji}</div>
          <span style={{ background: offer.badgeColor, color: '#fff', fontSize: 10, fontWeight: 800, padding: '5px 12px', borderRadius: 4, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>{offer.badge}</span>
        </div>
        <div style={{ fontFamily: "'Barlow'", fontSize: 11, fontWeight: 700, color: offer.accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>{offer.title}</div>
        <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: 26, fontWeight: 900, color: '#111', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 12 }}>{offer.headline}</h3>
        {/* Saving highlight */}
        <div style={{ display: 'inline-flex', flexDirection: 'column', background: offer.accent, color: '#fff', padding: '10px 18px', borderRadius: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: '0.04em' }}>{offer.savingLabel}</span>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{offer.saving}</span>
        </div>
      </div>

      <div style={{ padding: '20px 26px 24px' }}>
        <p style={{ fontSize: 14, color: '#777', lineHeight: 1.75, marginBottom: 16 }}>{offer.desc}</p>

        {/* Applicable bikes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {offer.bikes.map(b => (
            <span key={b} style={{ padding: '4px 10px', background: '#f5f5f5', borderRadius: 4, fontSize: 12, fontWeight: 700, color: '#555' }}>{b}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <span style={{ fontSize: 12 }}>📅</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>{offer.validity}</span>
        </div>

        {/* Terms accordion */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: offer.accent, letterSpacing: '0.04em' }}>
            {expanded ? '▲ Hide Terms' : '▼ View Terms & Conditions'}
          </button>
          {expanded && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              {offer.terms.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: offer.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#777' }}>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={scrollToBook} style={{
          width: '100%', padding: '13px', background: offer.accent, color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer',
          fontFamily: "'Barlow'", letterSpacing: '0.8px', textTransform: 'uppercase',
          transition: 'opacity 0.2s ease',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Claim This Offer →
        </button>
      </div>
    </div>
  );
}

export default function Offers() {
  const [activeType, setActiveType] = useState('All');
  const filtered = offers.filter(o => activeType === 'All' || o.type === activeType);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({ d: '05', h: '12', m: '30', s: '00' });
  useEffect(() => {
    const end = new Date('2025-04-30T23:59:59').getTime();
    const tick = setInterval(() => {
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) { clearInterval(tick); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d: String(d).padStart(2, '0'), h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Barlow', sans-serif; background: #f5f5f5; }
        .type-btn:hover { background: #111 !important; color: #fff !important; border-color: #111 !important; }
        @media (max-width: 480px) {
          .timer-box { padding: 14px 20px !important; }
          .timer-label { font-size: 10px !important; margin-bottom: 8px !important; }
          .timer-value { font-size: 32px !important; }
          .timer-unit { font-size: 9px !important; }
          .timer-separator { font-size: 24px !important; margin: 0 4px !important; }
          .type-btn { padding: 6px 12px !important; font-size: 11px !important; }
          .offer-card-title { font-size: 18px !important; }
          .offer-card-desc { font-size: 13px !important; }
        }
        @media (max-width: 640px) {
          .offers-grid { grid-template-columns: 1fr !important; }
          .banner-row { flex-direction: column !important; text-align: center !important; gap: 24px !important; }
          .banner-text h2 { font-size: clamp(28px, 10vw, 44px) !important; }
          .banner-buttons { width: 100% !important; flex-direction: column !important; }
          .banner-button { width: 100% !important; min-width: auto !important; }
          .timer-row { justify-content: center !important; gap: 4px !important; flex-wrap: wrap !important; }
          .hero-h1 { font-size: clamp(36px, 11vw, 76px) !important; }
          .filter-section { padding: 12px 4vw !important; }
        }
        @media (max-width: 768px) {
          .offers-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .hero-section { padding: 80px 4vw 60px !important; }
          .type-btn { padding: 7px 14px !important; font-size: 12px !important; }
        }
        @media (max-width: 960px) {
          .offers-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 1024px) {
          .offers-grid { gap: 16px !important; }
        }
      `}</style>

      {/* Hero with countdown */}
      <section style={{ background: '#111', backgroundImage: 'url(/images/bg1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: 'clamp(60px, 15vw, 120px) 5vw clamp(50px, 12vw, 80px)', color: '#fff', overflow: 'hidden' }} className="hero-section">
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.60) 100%)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: 700, letterSpacing: '3px', color: '#ff4d4d', textTransform: 'uppercase', marginBottom: 'clamp(12px, 3vw, 18px)' }}>── LIMITED TIME OFFERS ──</div>
          <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(36px, 9vw, 100px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-1px', marginBottom: 'clamp(16px, 3vw, 24px)' }} className="hero-h1">
            SAVE BIG ON<br /><span style={{ color: '#FF0000' }}>YOUR DREAM</span><br />HERO BIKE
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 17px)', color: 'rgba(255,255,255,0.7)', fontWeight: 500, maxWidth: 480, lineHeight: 1.65, margin: '0 auto clamp(24px, 5vw, 48px)' }}>
            Exclusive deals on exchange, finance, cashback & more. Don't miss out — offers end soon!
          </p>

          {/* Countdown Timer */}
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: 'clamp(12px, 3vw, 20px) clamp(20px, 5vw, 40px)' }} className="timer-box">
            <div style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 'clamp(8px, 2vw, 14px)' }} className="timer-label">Offers Expire In</div>
            <div className="timer-row" style={{ display: 'flex', gap: 'clamp(4px, 1vw, 8px)', alignItems: 'center' }}>
              {[['d', 'Days'], ['h', 'Hours'], ['m', 'Mins'], ['s', 'Secs']].map(([key, label], i) => (
                <>
                  {i > 0 && <span key={`sep-${i}`} style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(18px, 4vw, 36px)', fontWeight: 900, color: 'rgba(255,255,255,0.3)', lineHeight: 1 }} className="timer-separator">:</span>}
                  <div key={key} style={{ textAlign: 'center', minWidth: 'clamp(48px, 10vw, 64px)' }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 900, color: '#FF0000', lineHeight: 1 }} className="timer-value">{timeLeft[key]}</div>
                    <div style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', color: 'rgba(255,255,255,0.45)', fontWeight: 700, marginTop: 'clamp(2px, 0.5vw, 4px)' }} className="timer-unit">{label}</div>
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section style={{ background: '#fff', borderBottom: '1px solid #eee', padding: 'clamp(12px, 3vw, 18px) 5vw', position: 'sticky', top: 66, zIndex: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} className="filter-section">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 1200, margin: '0 auto', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {offerTypes.map(t => (
              <button key={t} className="type-btn" onClick={() => setActiveType(t)} style={{
                padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 700, fontFamily: "'Barlow'",
                background: activeType === t ? '#111' : '#fff',
                color: activeType === t ? '#fff' : '#666',
                border: activeType === t ? '1.5px solid #111' : '1.5px solid #ddd',
                cursor: 'pointer', transition: 'all 0.18s ease', textTransform: 'capitalize',
              }}>{t === 'All' ? 'All Offers' : typeLabels[t]}</button>
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#999' }}>{filtered.length} offers available</span>
        </div>
      </section>

      {/* Offers Grid */}
      <section style={{ background: '#f5f5f5', padding: '52px 5vw 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="offers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {filtered.map((o, i) => <OfferCard key={o.id} offer={o} index={i} />)}
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <section style={{ background: '#FF0000', padding: 'clamp(40px, 8vw, 64px) 5vw' }}>
        <div className="banner-row" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(20px, 5vw, 40px)', flexWrap: 'wrap' }}>
          <div style={{ color: '#fff' }} className="banner-text">
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(28px, 6vw, 56px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px', marginBottom: 'clamp(8px, 2vw, 12px)' }}>
              Need Help Choosing<br />the Right Offer?
            </h2>
            <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: 'rgba(255,255,255,0.82)', fontWeight: 500, maxWidth: 420, lineHeight: 1.65 }}>
              Call us or visit our showroom. Our team will help you stack the best offers and get maximum savings on your purchase.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vw, 14px)' }} className="banner-buttons">
            <a href="tel:+918650442200" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 14px)', padding: 'clamp(12px, 2vw, 18px) clamp(16px, 4vw, 32px)', background: '#fff', borderRadius: 10, textDecoration: 'none', minWidth: 'clamp(200px, 80vw, 280px)' }} className="banner-button">
              <div style={{ width: 'clamp(36px, 8vw, 44px)', height: 'clamp(36px, 8vw, 44px)', borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 3vw, 20px)', flexShrink: 0 }}>📞</div>
              <div>
                <div style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', fontWeight: 700, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Call Now</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(16px, 4vw, 24px)', fontWeight: 900, color: '#111', lineHeight: 1 }}>+91 86504 42200</div>
              </div>
            </a>
            <a href="https://wa.me/918650442200" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 2vw, 14px)', padding: 'clamp(12px, 2vw, 18px) clamp(16px, 4vw, 32px)', background: '#25D366', borderRadius: 10, textDecoration: 'none' }} className="banner-button">
              <div style={{ width: 'clamp(36px, 8vw, 44px)', height: 'clamp(36px, 8vw, 44px)', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(16px, 3vw, 20px)', flexShrink: 0 }}>💬</div>
              <div>
                <div style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>WhatsApp Us</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(16px, 4vw, 22px)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>Chat Instantly</div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}