import Seo from '../components/Seo';
import { BreadcrumbSchema } from '../components/Schema';
import { Link } from 'react-router-dom';
import '../styles/legal.css';


export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy Policy | PDR World — Data Protection & Cookie Policy"
        description="PDR World privacy policy covering data collection, cookie usage, and your rights under Indian data protection law. Read how we protect your personal information."
        canonical="https://pdr-sable.vercel.app/privacy"
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'Privacy Policy', url: 'https://pdr-sable.vercel.app/privacy' },
      ]} />

      <section className="legal-hero grid-bg">
        <div className="container">
          <div className="eyebrow">Legal</div>
          <h1 style={{ color: '#07008F' }}>Privacy Policy</h1>
          <p>Effective Date: January 1, 2025 | Last Updated: January 1, 2025</p>
        </div>
      </section>

      <section className="legal-content-section">
        <div className="container">
          <div className="legal-card">
            <article className="legal-article">
            <h2>1. Introduction</h2>
            <p>
              PDR Videotronics India Pvt. Ltd. ("PDR World", "we", "us") respects your privacy and is committed to
              protecting personal data you share with us through our website (pdrworld.com) and related communications.
              This policy explains what data we collect, how we use it, and your rights regarding your personal
              information.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <ul>
              <li><strong>Contact Forms:</strong> Name, email, phone number, company name, and inquiry details when you submit a quote request or contact form.</li>
              <li><strong>RFQ Submissions:</strong> Product specifications, quantities, and project details submitted through our request for quotation process.</li>
              <li><strong>Website Analytics:</strong> IP address, browser type, pages visited, and interaction patterns via standard analytics tools.</li>
              <li><strong>Cookies:</strong> Session cookies and functional cookies to improve site experience. See Section 6 for details.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Respond to RFQs and technical inquiries within our committed 24-hour response window</li>
              <li>Process orders and manage customer accounts</li>
              <li>Provide technical support and engineering consultation</li>
              <li>Send product updates, technical bulletins, and trade fair announcements (only with consent)</li>
              <li>Improve website performance and user experience</li>
            </ul>

            <h2>4. Data Sharing &amp; Disclosure</h2>
            <p>
              PDR World does not sell, rent, or trade your personal information to third parties. We may share data with:
            </p>
            <ul>
              <li><strong>Logistics partners:</strong> Shipping details necessary for order fulfillment</li>
              <li><strong>Legal authorities:</strong> When required by Indian law or court order</li>
              <li><strong>Service providers:</strong> Web hosting, analytics, and email delivery services operating under strict data processing agreements</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              We retain contact information and order records for a minimum of 7 years as required by Indian tax and
              commercial law. Marketing preferences can be updated or withdrawn at any time by contacting us.
            </p>

            <h2>6. Cookies</h2>
            <p>
              Our website uses essential cookies for site functionality and analytical cookies to understand usage
              patterns. No advertising or tracking cookies are used. You can disable cookies through your browser
              settings, though some site features may be affected.
            </p>

            <h2>7. Data Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data transmission (SSL/TLS),
              restricted access controls, and regular security audits to protect your personal information from
              unauthorized access, alteration, or disclosure.
            </p>

            <h2>8. Your Rights</h2>
            <p>Under applicable Indian data protection laws, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Withdraw consent for marketing communications at any time</li>
              <li>Lodge a complaint with the relevant data protection authority</li>
            </ul>

            <h2>9. International Transfers</h2>
            <p>
              As PDR World serves customers in 15+ countries, personal data may be transferred outside India for order
              fulfillment. All international transfers are subject to appropriate safeguards consistent with applicable
              data protection regulations.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy periodically. Changes will be posted on this page with an updated
              effective date. Continued use of our website after changes constitutes acceptance of the updated policy.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For privacy-related inquiries, data access requests, or to exercise your rights, contact us at{' '}
              <a href="mailto:info@pdrworld.com">info@pdrworld.com</a> or write to:
            </p>
            <address style={{ fontStyle: 'normal', padding: '16px 24px', background: 'var(--surface-3)', borderRadius: 'var(--rad)', marginTop: 12 }}>
              PDR Videotronics India Pvt. Ltd.<br />
              99, Old Prabhadevi Road<br />
              Mumbai 400025, Maharashtra, India<br />
              Tel: +91-22-24306494
            </address>
          </article>

            <div className="legal-contact">
              <p>Have questions about your data or privacy?</p>
              <Link className="btn btn-primary" to="/contact">Contact Our Team</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
