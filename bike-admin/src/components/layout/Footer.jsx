export default function Footer() {
  const styles = {
    footer: {
      background: '#000',
      borderTop: '1px solid #1f2937',
      padding: '2.5rem 0 4rem',
    },
    wrapper: {
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '0 1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '2rem',
    },
    brandHeading: {
      fontSize: '1.25rem',
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#fff',
    },
    accent: {
      color: '#ef4444',
    },
    textMuted: {
      color: '#9ca3af',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    sectionHeading: {
      color: '#fff',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    list: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      color: '#9ca3af',
      fontSize: '0.875rem',
      display: 'grid',
      gap: '0.625rem',
    },
    link: {
      color: '#9ca3af',
      textDecoration: 'none',
    },
    address: {
      color: '#9ca3af',
      fontSize: '0.875rem',
      fontStyle: 'normal',
      display: 'grid',
      gap: '0.5rem',
    },
    mapWrap: {
      position: 'relative',
      width: '100%',
      minHeight: '220px',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      marginBottom: '1rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
    },
    iframe: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      border: 0,
    },
    bottom: {
      marginTop: '3rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #1f2937',
      textAlign: 'center',
      fontSize: '0.875rem',
      color: '#6b7280',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.wrapper}>
        <div style={styles.grid}>

          {/* Brand + description */}
          <div>
            <h3 style={styles.brandHeading}>
              Ananant <span style={styles.accent}>Automobiles</span>
            </h3>
            <p style={styles.textMuted}>
              Authorized Dealer for Hero Bikes.<br />
              Best offers • Fast finance • Genuine service.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={styles.sectionHeading}>Quick Links</h4>
            <ul style={styles.list}>
              <li><a href="/bikes" style={styles.link}>All Bikes</a></li>
              <li><a href="/offers" style={styles.link}>Current Offers</a></li>
              <li><a href="/book-test-drive" style={styles.link}>Book Test Ride</a></li>
              <li><a href="/showrooms" style={styles.link}>Our Showrooms</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={styles.sectionHeading}>Contact</h4>
            <address style={styles.address}>
              <p>64Q4+M42 Front of Indian Petrol Pump,</p>
              <p>Ahmadgarh, Uttar Pradesh 203392</p>
              <p style={{ marginTop: '0.5rem' }}>
                <a href="tel:+919876543210" style={styles.link}>+91 8650442200</a>
              </p>
              <p>
                <a href="mailto:info@ankitbikes.com" style={styles.link}>info@anant-Automobiles.com</a>
              </p>
            </address>
          </div>

          {/* Map + Social & Timing */}
          <div>
            <h4 style={styles.sectionHeading}>Find Us</h4>

            {/* Google Maps Embed */}
            <div style={styles.mapWrap}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3514.9515929535423!2d78.1052799!3d28.2391489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390b53b7cdd781cd%3A0x4172937f4b27d8e7!2sHero%20-%20Anant%20Automobiles!5e0!3m2!1sen!2sin!4v1776542149871!5m2!1sen!2sin"
                style={styles.iframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ananant Automobiles Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...styles.wrapper, ...styles.bottom }}>
        © {new Date().getFullYear()} Ananant Automobiles. All rights reserved.
      </div>
    </footer>
  );
}