import Seo from '../components/Seo';
import { BreadcrumbSchema } from '../components/Schema';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Sale & Use | PDR World — Fiber Optic Components"
        description="Terms of sale, warranty, return policy, and conditions of use for PDR World fiber optic products. Read our complete terms before placing orders."
        canonical="https://pdr-sable.vercel.app/terms"
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'Terms of Sale', url: 'https://pdr-sable.vercel.app/terms' },
      ]} />

      <section className="section" style={{ paddingTop: 160, paddingBottom: 80 }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <h1 style={{ color: '#07008F', marginBottom: 32 }}>Terms of Sale &amp; Use</h1>
          <p style={{ color: '#475569', marginBottom: 32 }}>
            Effective Date: January 1, 2025 | Last Updated: January 1, 2025
          </p>

          <article style={{ lineHeight: 1.8, color: '#334155' }}>
            <h2>1. General Terms</h2>
            <p>
              These Terms of Sale govern all purchases of products and services from PDR Videotronics India Pvt. Ltd.
              ("PDR World", "we", "us"). By placing an order or using our website at pdrworld.com, you agree to these terms.
            </p>

            <h2>2. Order Process</h2>
            <p>
              All orders are subject to acceptance by PDR World. Upon receiving your Request for Quotation (RFQ), our
              engineering team will review specifications and provide a formal quotation within 24 business hours. Orders
              are confirmed only upon receipt of a written Purchase Order and agreed payment terms.
            </p>

            <h2>3. Pricing &amp; Payment</h2>
            <p>
              All prices are quoted in Indian Rupees (INR) or US Dollars (USD) as specified in the quotation. Prices are
              exclusive of applicable GST (GSTIN: 27AAACP2446G1ZL), shipping charges, and customs duties unless stated
              otherwise. Payment terms are typically 30 days net from invoice date for established accounts.
            </p>

            <h2>4. Shipping &amp; Delivery</h2>
            <p>
              PDR World ships from our manufacturing facility at Filmcity Complex, Goregaon East, Mumbai. Standard
              products are typically available for same-day dispatch. Custom assemblies and OEM orders carry lead times
              as specified in the quotation. Risk of loss transfers to the buyer upon handover to the carrier.
            </p>

            <h2>5. Product Warranty</h2>
            <p>
              All PDR World products are backed by a standard 12-month warranty from the date of delivery, covering
              defects in materials and workmanship under normal use. This warranty does not cover damage caused by
              improper installation, misuse, unauthorized modification, or environmental factors outside published
              operating specifications.
            </p>

            <h2>6. Returns &amp; Claims</h2>
            <p>
              Defective products must be reported within 7 business days of receipt. Returns require a Return Merchandise
              Authorization (RMA) number obtained from our support team. Products must be returned in original packaging
              with all documentation. Approved returns will be repaired, replaced, or credited at PDR World's discretion.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              PDR World's total liability for any claim arising out of or related to products sold shall not exceed the
              purchase price of the specific product(s) giving rise to the claim. In no event shall PDR World be liable
              for indirect, incidental, special, or consequential damages.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              All product designs, specifications, documentation, and trademarks on this website are the property of PDR
              Videotronics India Pvt. Ltd. Reproduction, distribution, or modification without written consent is
              prohibited.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction
              of the courts in Mumbai, Maharashtra, India.
            </p>

            <h2>10. Contact</h2>
            <p>
              For questions about these terms, please contact us at{' '}
              <a href="mailto:info@pdrworld.com" style={{ color: '#07008F' }}>info@pdrworld.com</a> or call
              +91-22-24306494.
            </p>
          </article>

          <div style={{ marginTop: 60, padding: '32px', background: '#F8FAFC', borderRadius: 'var(--rad)', border: '1px solid var(--line)', textAlign: 'center' }}>
            <p style={{ marginBottom: 16, color: '#475569' }}>Have questions about an existing order or need a formal quotation?</p>
            <Link className="btn btn-primary" to="/contact">Contact Our Team</Link>
          </div>
        </div>
      </section>
    </>
  );
}
