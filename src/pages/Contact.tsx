import Seo from '../components/Seo';
import '../styles/contact.css';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Thank you. Our team will respond within 24 hours.');
    e.currentTarget.reset();
  };

  return (
    <>
      <Seo
        title="Contact Us | Request a Quote & Engineering Support — PDR World"
        description="Get in touch with PDR World (Videotronics India) for RFQs, technical engineering consultation, or partnership inquiries. Headquarters and manufacturing based in Mumbai."
        canonical="https://pdrworld.com/contact"
      />

      {/* HERO & MAIN GRID */}
      <section className="ct-hero">
        <div className="container">
          <div className="eyebrow">Contact Us</div>
          <h1 style={{ color: '#07008F' }}>Get in touch with PDR.</h1>
          <p style={{ fontSize: 18, color: '#475569', marginTop: 16, maxWidth: 600 }}>Whether you need a custom manufacturing quote, technical support, or distribution details, our team in Mumbai is ready to assist.</p>

          <div className="ct-grid">
            {/* Info Cards */}
            <div className="reveal">
              <div className="ct-info-card">
                <h3><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> Headquarters</h3>

                <div className="ct-detail-row">
                  <div className="ct-detail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div>
                  <div className="ct-detail-text">
                    <h4>Registered Office</h4>
                    <p>PDR Videotronics India Pvt. Ltd.<br />99 Old Prabhadevi Road<br />Mumbai - 400025, Maharashtra, India</p>
                  </div>
                </div>

                <div className="ct-detail-row">
                  <div className="ct-detail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                  <div className="ct-detail-text">
                    <h4>Phone</h4>
                    <a href="tel:+912224306494">+91-22-24306494</a><br />
                    <a href="tel:+912224309536">+91-22-24309536</a><br />
                    <a href="https://wa.me/918419916460" rel="noopener noreferrer">WhatsApp: +91 84199 16460</a>
                  </div>
                </div>

                <div className="ct-detail-row">
                  <div className="ct-detail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
                  <div className="ct-detail-text">
                    <h4>Email</h4>
                    <a href="mailto:info@pdrworld.com">info@pdrworld.com</a><br />
                    <a href="mailto:sales@pdrworld.com">sales@pdrworld.com</a>
                  </div>
                </div>
              </div>

              <div className="ct-info-card">
                <h3><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> Manufacturing</h3>

                <div className="ct-detail-row">
                  <div className="ct-detail-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div>
                  <div className="ct-detail-text">
                    <h4>Factory Address</h4>
                    <p>Filmcity Complex, Gen. A.K. Vaidya Marg<br />Goregaon East, Mumbai - 400065, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="ct-form-wrap">
                <div className="ct-form-head">
                  <h2>Send an Inquiry</h2>
                  <p>Fill out the form below and our sales or engineering team will respond within 24 hours.</p>
                </div>

                <form className="ct-form" id="pdrForm" onSubmit={handleSubmit}>
                  <div className="ct-form-row">
                    <div className="ct-field">
                      <label htmlFor="fname">First Name <span>*</span></label>
                      <input type="text" id="fname" name="fname" className="ct-input" required />
                    </div>
                    <div className="ct-field">
                      <label htmlFor="lname">Last Name <span>*</span></label>
                      <input type="text" id="lname" name="lname" className="ct-input" required />
                    </div>
                  </div>

                  <div className="ct-form-row">
                    <div className="ct-field">
                      <label htmlFor="email">Work Email <span>*</span></label>
                      <input type="email" id="email" name="email" className="ct-input" required />
                    </div>
                    <div className="ct-field">
                      <label htmlFor="phone">Phone Number <span>*</span></label>
                      <input type="tel" id="phone" name="phone" className="ct-input" required />
                    </div>
                  </div>

                  <div className="ct-field">
                    <label htmlFor="company">Company / Organization <span>*</span></label>
                    <input type="text" id="company" name="company" className="ct-input" required />
                  </div>

                  <div className="ct-field">
                    <label htmlFor="inquiryType">Inquiry Type <span>*</span></label>
                    <select id="inquiryType" name="inquiryType" className="ct-select" required defaultValue="">
                      <option value="">Select an option...</option>
                      <option value="Active Components">Active Components (SFP, OLP, etc.)</option>
                      <option value="Passive Components">Passive Components (Patchcords, Splitters, etc.)</option>
                      <option value="Cable Management">Cable Management Devices</option>
                      <option value="Test Equipment">Test &amp; Measuring Equipment</option>
                      <option value="Custom Manufacturing">Custom Manufacturing / OEM</option>
                      <option value="Smart Systems">Smart Systems (DAS/DTS/Drone)</option>
                      <option value="Distributorship">Become a Distributor</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="ct-field">
                    <label htmlFor="message">Message / Requirements</label>
                    <textarea id="message" name="message" className="ct-textarea" placeholder="Please provide part numbers, specifications, or details about your project..."></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 16, marginTop: 8 }}>Submit Inquiry →</button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)', marginTop: 12, justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Your data is secure · Response within 24 hours · No spam
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="section">
        <div className="container reveal">
          <div className="ct-map-wrap">
            <iframe src="https://maps.google.com/maps?q=PDR+Videotronics+99+Old+Prabhadevi+Road+Mumbai+400025&output=embed" allowFullScreen loading="lazy"></iframe>
          </div>
        </div>
      </section>
    </>
  );
}
