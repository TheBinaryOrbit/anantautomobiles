import React, { useState, useEffect } from 'react';

const BRANDS = ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki', 'KTM'];

const BookYourDreamBike = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    brand: '',
    model: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 860);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare form data for Forminit with proper field prefixes
      const formDataToSend = new FormData();
      formDataToSend.append('fi-sender-fullName', formState.fullName);
      formDataToSend.append('fi-sender-email', formState.email);
      formDataToSend.append('fi-text-phone', formState.phone);
      formDataToSend.append('fi-text-city', formState.city);
      formDataToSend.append('fi-text-brand', formState.brand);
      formDataToSend.append('fi-text-model', formState.model);

      const response = await fetch('https://forminit.com/f/x1mlf5p6870', {
        method: 'POST',
        body: formDataToSend,
      });

      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        // If response is not JSON, just check status code
        responseData = { success: response.ok };
      }

      if (responseData.success === true || (response.ok && !responseData.error)) {
        setMessage({
          type: 'success',
          text: 'Thank you! Your inquiry has been received. Our team will contact you soon.'
        });
        // Reset form
        setFormState({
          fullName: '',
          email: '',
          phone: '',
          city: '',
          brand: '',
          model: '',
        });
      } else {
        setMessage({
          type: 'error',
          text: responseData.message || 'Error submitting form. Please try again.'
        });
      }
    } catch (error) {
      console.error('Form error:', error);
      setMessage({
        type: 'error',
        text: 'Error submitting form. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700;800&display=swap');
        
        * {
          box-sizing: border-box;
        }

        .dream-bike-form input,
        .dream-bike-form select {
          width: 100%;
          padding: 13px 15px;
          font-size: 14px;
          color: #222;
          background-color: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          outline: none;
          font-family: 'Barlow', sans-serif;
          transition: all 0.2s ease;
        }

        .dream-bike-form input:focus,
        .dream-bike-form select:focus {
          border-color: #e60000;
          box-shadow: 0 0 0 3px rgba(230, 0, 0, 0.12);
        }

        .dream-bike-form label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 7px;
          font-family: 'Barlow', sans-serif;
          letter-spacing: 0.02em;
        }

        .dream-bike-form button {
          width: 100%;
          max-width: 420px;
          padding: 15px 40px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #fff;
          background-color: #e60000;
          border: none;
          border-radius: 9px;
          cursor: pointer;
          font-family: 'Barlow', sans-serif;
          transition: all 0.22s ease;
        }

        .dream-bike-form button:hover:not(:disabled) {
          background-color: #cc0000;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(230, 0, 0, 0.48);
        }

        .dream-bike-form button:disabled {
          background-color: #999;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .form-message {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Barlow', sans-serif;
          max-width: 420px;
          margin-left: auto;
          margin-right: auto;
        }

        .form-message.success {
          background-color: #e0ffe0;
          color: #00c600;
        }

        .form-message.error {
          background-color: #ffe0e0;
          color: #c60000;
        }

        @media (max-width: 860px) {
          .content-wrapper {
            padding: 32px 16px;
          }
          .hero-text h1 {
            font-size: clamp(38px, 11vw, 58px);
          }
          .dream-bike-form {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            max-width: 100%;
          }
          .dream-bike-form button {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .hero-text h1 {
            font-size: clamp(32px, 10vw, 48px);
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
        padding: isMobile ? '60px 20px' : '40px 5vw',
      }}
      id="book-your-dream-bike">
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

          {/* Hero text */}
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

          {/* Form */}
          <form className="dream-bike-form" onSubmit={handleFormSubmit} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '18px 24px',
            width: '100%',
            maxWidth: '620px',
            margin: '0 auto',
          }}>
            {/* Full Name */}
            <div>
              <label style={{ color: '#fff' }}>Full Name <span style={{ color: '#ff4d4d' }}>*</span></label>
              <input
                type="text"
                name="fullName"
                value={formState.fullName}
                onChange={handleInputChange}
                placeholder="Your name"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ color: '#fff' }}>Phone <span style={{ color: '#ff4d4d' }}>*</span></label>
              <input
                type="tel"
                name="phone"
                value={formState.phone}
                onChange={handleInputChange}
                placeholder="Phone number"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ color: '#fff' }}>Email <span style={{ color: '#ff4d4d' }}>*</span></label>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleInputChange}
                placeholder="Email address"
                required
              />
            </div>

            {/* City */}
            <div>
              <label style={{ color: '#fff' }}>City <span style={{ color: '#ff4d4d' }}>*</span></label>
              <input
                type="text"
                name="city"
                value={formState.city}
                onChange={handleInputChange}
                placeholder="Lucknow / Kanpur..."
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label style={{ color: '#fff' }}>Brand <span style={{ color: '#ff4d4d' }}>*</span></label>
              <select
                name="brand"
                value={formState.brand}
                onChange={handleInputChange}
                required
                style={{ color: formState.brand ? '#222' : '#999' }}
              >
                <option value="">Select brand</option>
                {BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label style={{ color: '#fff' }}>Model <span style={{ color: '#ff4d4d' }}>*</span></label>
              <input
                type="text"
                name="model"
                value={formState.model}
                onChange={handleInputChange}
                placeholder="Classic 350 / Pulsar..."
                required
              />
            </div>

            {/* Submit Button */}
            <div style={{ gridColumn: '1 / -1', marginTop: '12px', textAlign: 'center' }}>
              <button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Enquire Now →'}
              </button>

              {message.text && (
                <div className={`form-message ${message.type}`}>
                  {message.text}
                </div>
              )}
            </div>
          </form>

        </div>
      </section>
    </>
  );
};

export default BookYourDreamBike;