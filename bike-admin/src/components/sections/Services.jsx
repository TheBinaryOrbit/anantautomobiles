import { useState, useEffect, useRef } from 'react';

const services = [
  {
    id: 1,
    icon: '🔧',
    title: 'General Service',
    desc: 'Complete bike servicing including oil change, filter replacement, brake check, and full safety inspection by certified Hero mechanics.',
    price: 'Starting ₹499',
    duration: '2–3 hrs',
    highlights: ['Engine Oil Change', 'Air Filter Check', 'Brake Adjustment', 'Chain Lubrication'],
    color: '#fff5f5',
    accent: '#FF0000',
  },
  {
    id: 2,
    icon: '⚙️',
    title: 'Engine Overhaul',
    desc: 'Deep engine diagnostics and repair. Our expert technicians ensure your bike runs at peak performance with genuine Hero spare parts.',
    price: 'Starting ₹1,999',
    duration: '1–2 days',
    highlights: ['Complete Diagnostics', 'Genuine Spare Parts', 'Performance Tuning', '6-Month Warranty'],
    color: '#f5f5ff',
    accent: '#4444FF',
  },
  {
    id: 3,
    icon: '🛞',
    title: 'Tyre & Wheel',
    desc: 'Tyre replacement, puncture repair, wheel balancing and alignment. We stock all Hero-recommended tyre sizes.',
    price: 'Starting ₹199',
    duration: '30–60 min',
    highlights: ['Tyre Replacement', 'Puncture Repair', 'Wheel Balancing', 'Rim Straightening'],
    color: '#f5fff5',
    accent: '#00AA44',
  },
  {
    id: 4,
    icon: '⚡',
    title: 'Electrical & Battery',
    desc: 'Battery testing, replacement, wiring diagnostics, and full electrical system check for all Hero bike models.',
    price: 'Starting ₹299',
    duration: '1–2 hrs',
    highlights: ['Battery Testing', 'Wiring Inspection', 'Lighting Repair', 'Starter Motor Check'],
    color: '#fffdf5',
    accent: '#FF8800',
  },
  {
    id: 5,
    icon: '🎨',
    title: 'Denting & Painting',
    desc: 'Professional dent removal and custom painting with OEM color-matched paint. Restore your bike to showroom condition.',
    price: 'Starting ₹799',
    duration: '2–3 days',
    highlights: ['Dent Removal', 'OEM Color Match', 'Scratch Repair', 'Full Panel Painting'],
    color: '#f5faff',
    accent: '#0088CC',
  },
  {
    id: 6,
    icon: '🏠',
    title: 'Doorstep Service',
    desc: 'Can\'t visit us? We come to you! Book a doorstep service and our mechanic will service your bike at your home or office.',
    price: 'Starting ₹699',
    duration: '2–3 hrs',
    highlights: ['Home Visit', 'No Extra Charges', 'Same Day Booking', 'Expert Mechanics'],
    color: '#fff5fb',
    accent: '#CC0066',
  },
];

const process = [
  { step: '01', title: 'Book Online', desc: 'Fill the booking form or call us to schedule your service appointment.' },
  { step: '02', title: 'Drop Your Bike', desc: 'Bring your bike to our workshop. We provide a free pick-up on premium services.' },
  { step: '03', title: 'Expert Service', desc: 'Certified Hero technicians service your bike using genuine parts only.' },
  { step: '04', title: 'Ready to Ride', desc: 'Get notified when done. Pick up a thoroughly inspected, running-perfect bike.' },
];

function ServiceCard({ s, index }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      border: '1.5px solid #eee',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms`,
      cursor: 'pointer',
    }} onClick={() => setExpanded(!expanded)}>
      {/* Colored top strip */}
      <div style={{ height: 5, background: s.accent }} />
      <div style={{ padding: 'clamp(20px, 5vw, 28px) clamp(16px, 4vw, 26px)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'clamp(8px, 2vw, 12px)' }} className="service-card-header">
          <div style={{ fontSize: 'clamp(32px, 8vw, 40px)', lineHeight: 1 }}>{s.icon}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'clamp(10px, 2vw, 11px)', color: '#aaa', fontWeight: 600, marginBottom: 2 }}>Starting from</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: s.accent }}>{s.price}</div>
          </div>
        </div>
        <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: '#111', margin: 'clamp(10px, 2vw, 14px) 0 clamp(8px, 1.5vw, 10px)', letterSpacing: '-0.02em' }} className="service-title">{s.title}</h3>
        <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', color: '#777', lineHeight: 1.7, marginBottom: 'clamp(12px, 3vw, 16px)' }} className="service-desc">{s.desc}</p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: '#aaa' }}>⏱</span>
            <span style={{ fontSize: 'clamp(12px, 2vw, 13px)', fontWeight: 700, color: '#666' }}>{s.duration}</span>
          </div>
          <span style={{ fontSize: 'clamp(12px, 2vw, 13px)', fontWeight: 700, color: s.accent }}>
            {expanded ? 'Less ▲' : 'Details ▼'}
          </span>
        </div>

        {expanded && (
          <div style={{ marginTop: 'clamp(16px, 3vw, 20px)', paddingTop: 'clamp(12px, 2vw, 18px)', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ fontWeight: 800, fontSize: 'clamp(11px, 2vw, 12px)', color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'clamp(10px, 2vw, 12px)' }}>What's Included</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'clamp(6px, 1.5vw, 8px)' }} className="service-highlights">
              {s.highlights.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(6px, 1.5vw, 8px)' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: s.accent, flexShrink: 0, marginTop: 6 }} />
                  <span style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: '#555', fontWeight: 600 }}>{h}</span>
                </div>
              ))}
            </div>
            <button onClick={(e) => { e.stopPropagation(); window.location.href = '/#book-your-dream-bike'; }} style={{
              width: '100%', marginTop: 'clamp(16px, 3vw, 20px)', padding: 'clamp(10px, 2vw, 12px)', background: s.accent, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 'clamp(12px, 2vw, 13px)', fontWeight: 800, cursor: 'pointer',
              fontFamily: "'Barlow'", letterSpacing: '0.8px', textTransform: 'uppercase',
            }}>
              Book This Service →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Services() {
  const [bookForm, setBookForm] = useState({ name: '', phone: '', service: '', date: '' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Barlow', sans-serif; }
        .submit-btn:hover { background: #cc0000 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(230,0,0,0.4) !important; }
        @media (max-width: 480px) {
          .services-grid { gap: 12px !important; }
          .service-card-header { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .service-title { font-size: 20px !important; margin: 10px 0 8px !important; }
          .service-desc { font-size: 13px !important; }
          .service-highlights { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: 1fr !important; }
          .process-row { flex-direction: column !important; gap: 24px !important; align-items: center !important; }
          .process-connector { display: none !important; }
          .booking-row { flex-direction: column !important; gap: 24px !important; }
          .hero-h1 { font-size: clamp(32px, 11vw, 52px) !important; }
          .booking-form-container { padding: 20px !important; }
          .booking-form-row { flex-direction: column !important; }
          .booking-form-input { width: 100% !important; }
        }
        @media (max-width: 768px) {
          .hero-section { padding: 80px 4vw 60px !important; }
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .process-step { padding: 20px 12px !important; }
          .process-item-value { font-size: 28px !important; }
        }
        @media (max-width: 900px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 1024px) {
          .services-grid { gap: 16px !important; }
        }
      `}</style>

      {/* Hero */}
      <section style={{ background: '#111', backgroundImage: 'url(/images/bg1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: 'clamp(60px, 15vw, 120px) 5vw clamp(50px, 12vw, 80px)', color: '#fff', overflow: 'hidden' }} className="hero-section">
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: 700, letterSpacing: '3px', color: '#ff4d4d', textTransform: 'uppercase', marginBottom: 'clamp(12px, 3vw, 16px)' }}>── SERVICE CENTER ──</div>
          <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(36px, 8vw, 88px)', fontWeight: 900, lineHeight: 0.93, letterSpacing: '-1px', marginBottom: 'clamp(16px, 3vw, 22px)' }}>
            EXPERT BIKE<br /><span style={{ color: '#FF0000' }}>SERVICING</span><br />AT YOUR DOOR
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 17px)', color: 'rgba(255,255,255,0.7)', fontWeight: 500, maxWidth: 480, lineHeight: 1.65, marginBottom: 'clamp(24px, 5vw, 36px)' }}>
            Authorized Hero service center with certified technicians, genuine parts, and transparent pricing.
          </p>
          <div style={{ display: 'flex', gap: 'clamp(20px, 5vw, 32px)', flexWrap: 'wrap', paddingTop: 'clamp(24px, 5vw, 36px)', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            {[['Certified', 'Hero Technicians'], ['Genuine', 'Spare Parts Only'], ['10,000+', 'Services Done'], ['Same Day', 'Delivery*']].map(([val, label]) => (
              <div key={label} className="stat-item">
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: '#FF0000', lineHeight: 1 }} className="process-item-value">{val}</div>
                <div style={{ fontSize: 'clamp(11px, 2vw, 12px)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginTop: 'clamp(2px, 0.5vw, 4px)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ background: '#f5f5f5', padding: 'clamp(48px, 10vw, 72px) 5vw' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 8vw, 56px)' }}>
            <p style={{ fontFamily: "'Barlow'", fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, letterSpacing: '0.22em', color: '#FF0000', textTransform: 'uppercase', marginBottom: 'clamp(8px, 2vw, 10px)' }}>What We Offer</p>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(28px, 6vw, 56px)', fontWeight: 900, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>Our Services</h2>
          </div>
          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {services.map((s, i) => <ServiceCard key={s.id} s={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ background: '#fff', padding: 'clamp(48px, 10vw, 72px) 5vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 8vw, 56px)' }}>
            <p style={{ fontFamily: "'Barlow'", fontSize: 'clamp(11px, 2vw, 13px)', fontWeight: 700, letterSpacing: '0.22em', color: '#FF0000', textTransform: 'uppercase', marginBottom: 'clamp(8px, 2vw, 10px)' }}>Simple Process</p>
            <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 900, color: '#111', letterSpacing: '-0.03em' }}>How It Works</h2>
          </div>
          <div className="process-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
            {process.map((p, i) => (
              <>
                <div key={p.step} style={{ flex: '1 1 clamp(140px, 20vw, 200px)', maxWidth: 240, textAlign: 'center', padding: '0 clamp(8px, 2vw, 16px)' }} className="process-step">
                  <div style={{ width: 'clamp(56px, 12vw, 72px)', height: 'clamp(56px, 12vw, 72px)', borderRadius: '50%', background: i === 0 ? '#FF0000' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto clamp(12px, 3vw, 20px)', color: '#fff', fontFamily: "'Barlow Condensed'", fontSize: 'clamp(18px, 4vw, 26px)', fontWeight: 900 }}>{p.step}</div>
                  <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: 900, color: '#111', marginBottom: 'clamp(6px, 1.5vw, 10px)' }}>{p.title}</h3>
                  <p style={{ fontSize: 'clamp(13px, 2vw, 14px)', color: '#888', lineHeight: 1.7 }}>{p.desc}</p>
                </div>
                {i < process.length - 1 && (
                  <div className="process-connector" style={{ flexShrink: 0, paddingTop: 'clamp(24px, 5vw, 36px)', color: '#ddd', fontSize: 'clamp(16px, 3vw, 24px)', fontWeight: 300 }}>→</div>
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Booking */}
      <section style={{ background: '#111', padding: 'clamp(48px, 10vw, 72px) 5vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="booking-row" style={{ display: 'flex', gap: 'clamp(32px, 8vw, 64px)', alignItems: 'center' }}>
            <div style={{ flex: 1, color: '#fff' }}>
              <p style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(10px, 2vw, 13px)', fontWeight: 700, letterSpacing: '3px', color: '#ff4d4d', textTransform: 'uppercase', marginBottom: 'clamp(12px, 2vw, 16px)' }}>QUICK BOOKING</p>
              <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(28px, 6vw, 60px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px', marginBottom: 'clamp(16px, 3vw, 20px)' }}>Book Your<br /><span style={{ color: '#FF0000' }}>Service</span> Today</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(14px, 3vw, 16px)', lineHeight: 1.7, marginBottom: 'clamp(20px, 4vw, 28px)' }}>Don't wait until it breaks. Regular servicing keeps your Hero performing at its best and extends bike life.</p>
              <div style={{ display: 'flex', gap: 'clamp(12px, 3vw, 24px)', flexWrap: 'wrap' }}>
                {['✓ Free Pickup & Drop*', '✓ Genuine Parts Only', '✓ Transparent Pricing'].map(txt => (
                  <span key={txt} style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>{txt}</span>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 16, padding: 'clamp(24px, 5vw, 36px) clamp(20px, 4vw, 32px)', maxWidth: 480 }}>
              <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: '#111', marginBottom: 'clamp(16px, 3vw, 24px)' }}>Schedule a Service</h3>
              <div style={{ display: 'grid', gap: 'clamp(12px, 2vw, 16px)' }}>
                {[
                  { label: 'Your Name *', name: 'name', type: 'text', placeholder: 'Full name' },
                  { label: 'Phone *', name: 'phone', type: 'tel', placeholder: '+91 XXXXX XXXXX' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ display: 'block', fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 700, color: '#555', marginBottom: 'clamp(4px, 1vw, 6px)', letterSpacing: '0.04em' }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder} value={bookForm[f.name]}
                      onChange={e => setBookForm(p => ({ ...p, [f.name]: e.target.value }))}
                      style={{ width: '100%', padding: 'clamp(10px, 2vw, 12px) clamp(10px, 2vw, 14px)', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 'clamp(13px, 2vw, 14px)', fontFamily: "'Barlow'", outline: 'none' }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: 700, color: '#555', marginBottom: 'clamp(4px, 1vw, 6px)', letterSpacing: '0.04em' }}>Service Type *</label>
                  <select value={bookForm.service} onChange={e => setBookForm(p => ({ ...p, service: e.target.value }))}
                    style={{ width: '100%', padding: 'clamp(10px, 2vw, 12px) clamp(10px, 2vw, 14px)', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 'clamp(13px, 2vw, 14px)', fontFamily: "'Barlow'", outline: 'none', background: '#fff' }}>
                    <option value="">Select service</option>
                    {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
                <button className="submit-btn" onClick={() => alert('Service booked! We\'ll call you to confirm.')}
                  style={{ width: '100%', padding: 'clamp(11px, 2vw, 14px)', background: '#FF0000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 800, cursor: 'pointer', fontFamily: "'Barlow'", letterSpacing: '0.8px', textTransform: 'uppercase', transition: 'all 0.22s ease' }}>
                  Book Service →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}