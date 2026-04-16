import React, { useState, useEffect } from 'react';

const BRANDS = ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM'];

const BookYourDreamBike = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', brand: '', model: '', city: '',
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! Our team will get in touch with you soon.');
  };

  const inputStyle = {
    width: '100%',
    padding: '13px 15px',
    fontSize: '14px',
    color: '#222',
    backgroundColor: '#fff',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif",
    transition: 'border-color 0.25s, box-shadow 0.25s',
  };

  const focusStyle = { borderColor: '#e60000', boxShadow: '0 0 0 3px rgba(230,0,0,0.12)' };
  const blurStyle  = { borderColor: '#e0e0e0', boxShadow: 'none' };

  const labelStyle = {
    display: 'block',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '7px',
    fontFamily: "'Barlow', sans-serif",
    letterSpacing: '0.02em',
  };

  const FormFields = ({ labelColor = '#fff' }) => (
    <form onSubmit={handleSubmit} style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '18px 24px',
      width: '100%',
      maxWidth: '620px',           // ← prevents form from becoming too wide
      margin: '0 auto',            // ← centers the form
    }}>
      <div>
        <label style={{ ...labelStyle, color: labelColor }}>Full Name <span style={{ color: '#ff4d4d' }}>*</span></label>
        <input type="text" name="name" value={formData.name} onChange={handleChange}
          placeholder="Your name" required style={inputStyle}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)} />
      </div>

      <div>
        <label style={{ ...labelStyle, color: labelColor }}>Phone <span style={{ color: '#ff4d4d' }}>*</span></label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
          placeholder="Phone number" required style={inputStyle}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)} />
      </div>

      <div>
        <label style={{ ...labelStyle, color: labelColor }}>Email <span style={{ color: '#ff4d4d' }}>*</span></label>
        <input type="email" name="email" value={formData.email} onChange={handleChange}
          placeholder="Email address" required style={inputStyle}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)} />
      </div>

      <div>
        <label style={{ ...labelStyle, color: labelColor }}>City <span style={{ color: '#ff4d4d' }}>*</span></label>
        <input type="text" name="city" value={formData.city} onChange={handleChange}
          placeholder="Lucknow / Kanpur..." required style={inputStyle}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)} />
      </div>

      <div>
        <label style={{ ...labelStyle, color: labelColor }}>Brand <span style={{ color: '#ff4d4d' }}>*</span></label>
        <select name="brand" value={formData.brand} onChange={handleChange} required
          style={{ ...inputStyle, color: formData.brand ? '#222' : '#999' }}>
          <option value="" disabled>Select brand</option>
          {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <label style={{ ...labelStyle, color: labelColor }}>Model <span style={{ color: '#ff4d4d' }}>*</span></label>
        <input type="text" name="model" value={formData.model} onChange={handleChange}
          placeholder="Classic 350 / Pulsar..." required style={inputStyle}
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)} />
      </div>

      <div style={{ gridColumn: '1 / -1', marginTop: '12px', textAlign: 'center' }}>
        <button type="submit" style={{
          width: '100%',
          maxWidth: '420px',
          padding: '15px 40px',
          fontSize: '15px',
          fontWeight: 800,
          letterSpacing: '1.4px',
          textTransform: 'uppercase',
          color: '#fff',
          backgroundColor: '#e60000',
          border: 'none',
          borderRadius: '9px',
          cursor: 'pointer',
          fontFamily: "'Barlow', sans-serif",
          transition: 'all 0.22s ease',
        }}>
          Enquire Now →
        </button>
      </div>
    </form>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');

        button:hover {
          background-color: #cc0000 !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(230,0,0,0.48) !important;
        }

        @media (max-width: 860px) {
          .content-wrapper {
            padding: 32px 16px !important;
          }
          .hero-text h1 {
            font-size: clamp(38px, 11vw, 58px) !important;
          }
          form {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            max-width: 100% !important;
          }
          button {
            max-width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          .hero-text h1 {
            font-size: clamp(32px, 10vw, 48px) !important;
          }
        }
      `}</style>

      <section style={{
        position: 'relative',
        minHeight: '80vh',
        backgroundImage: 'url(/images/bg1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '40px 5vw',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.72))',
          zIndex: 1,
        }} />

        <div className="content-wrapper" style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isMobile ? '36px' : '60px',
        }}>

          {/* Hero text – always centered */}
          <div className="hero-text" style={{
            color: '#fff',
            textAlign: 'center',
            maxWidth: '780px',
          }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(13px, 1.5vw, 16px)',
              fontWeight: 700,
              letterSpacing: '5px',
              color: '#ff4d4d',
              marginBottom: '16px',
              textTransform: 'uppercase',
            }}>
              ── BOOK YOUR DREAM BIKE ──
            </div>

            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(48px, 7vw, 82px)',
              fontWeight: 900,
              margin: '0 0 20px',
              lineHeight: 0.96,
              letterSpacing: '-0.5px',
            }}>
              Get Your 
              <span style={{ color: '#ff4d4d' }}> Personalized </span>
              Quote
            </h1>
          </div>

          {/* Form – centered, no background on desktop */}
          <div style={{
            width: '100%',
            color: isMobile ? '#111' : '#fff',
            background: isMobile ? 'transparent' : 'transparent',
            backdropFilter: isMobile ? 'none' : 'none',
            borderRadius: '16px',
            padding: isMobile ? '28px 20px' : '0',
            boxShadow: isMobile ? '0 12px 44px rgba(0,0,0,0.2)' : 'none',
          }}>
            <FormFields labelColor={isMobile ? '#fff' : '#fff'} />
          </div>

        </div>
      </section>
    </>
  );
};

export default BookYourDreamBike;