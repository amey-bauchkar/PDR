import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { BreadcrumbSchema, ServiceSchema } from '../components/Schema';
import '../styles/solutions.css';

export default function Solutions() {
  return (
    <>
      <Seo
        title="Fiber Optic Infrastructure Solutions | DAS, DTS & Network Monitoring — PDR World"
        description="Custom-engineered fiber optic infrastructure: Distributed Acoustic Sensing, Distributed Temperature Sensing, and fiber link monitoring. Field-proven for telecom, defence, and utilities."
        canonical="https://pdrworld.com/solutions"
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdrworld.com/' },
        { name: 'Solutions', url: 'https://pdrworld.com/solutions' },
      ]} />
      <ServiceSchema 
        name="Fiber Optic Infrastructure Solutions"
        description="Custom-engineered fiber optic infrastructure: Distributed Acoustic Sensing, Distributed Temperature Sensing, and fiber link monitoring. Field-proven for telecom, defence, and utilities."
        serviceType="Telecommunications Infrastructure"
      />
      {/* Removed nested <main> — Layout already provides <main> */}
        {/* HERO */}
        <section className="sl-hero reveal">
          <div className="container">
            <div className="sl-hero-inner">
              <div className="eyebrow">PDR INFRASTRUCTURE SYSTEMS</div>
              <h1>Fiber Optic Sensing & Monitoring Solutions for Critical Infrastructure</h1>
              <p>We engineer specialized infrastructure for link integrity, acoustic sensing, and thermal profiling. Our solutions focus on fault localization and network survivability in the world's most demanding industrial environments.</p>
              <div className="sl-hero-actions">
                <a href="#sensing" className="sl-hero-btn">View Sensing Systems</a>
                <a href="#industries" className="sl-hero-link">Deployment Use Cases →</a>
              </div>
            </div>
          </div>
        </section>

        {/* SENSING & MONITORING */}
        <section className="section reveal" id="sensing">
          <div className="container">
            <div className="sl-section-head">
              <div className="eyebrow">MONITORING SYSTEMS</div>
              <h2>Real-time link integrity and distributed sensing.</h2>
              <p>We convert existing fiber optic infrastructure into a continuous, high-fidelity sensing instrument for structural health and operational visibility.</p>
            </div>

            {/* DAS */}
            <div className="sl-solution-row sl-split-2-1 reveal">
              <div className="sl-text-block">
                <div className="eyebrow">ACOUSTIC DETECTION</div>
                <h3>Distributed Acoustic Sensing (DAS)</h3>
                <p>Convert installed fiber routes into a continuous acoustic detection layer for perimeter security, leak monitoring, and intrusion alerts. Our DAS platform classifies vibrations with pinpoint accuracy, filtering environmental noise to identify real threats.</p>
                <div className="sl-use-case">
                  <strong>Key Outcome:</strong> Instant localization of unauthorized activity or physical breaches along 50km+ corridors.
                </div>
                <Link to="/contact?inquiry=DAS" className="sl-hero-btn" style={{ padding: '14px 28px' }}>Request Engineering Specs</Link>
              </div>
              <div className="sl-metrics-grid">
                <div className="sl-metric-card">
                  <span className="sl-metric-val">50km+</span>
                  <span className="sl-metric-label">Range per channel</span>
                  <span className="sl-metric-sub">Continuous monitoring</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">±5m</span>
                  <span className="sl-metric-label">Spatial Resolution</span>
                  <span className="sl-metric-sub">Event localization</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">10kHz</span>
                  <span className="sl-metric-label">Sampling Rate</span>
                  <span className="sl-metric-sub">Acoustic fidelity</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">AI/ML</span>
                  <span className="sl-metric-label">Classification</span>
                  <span className="sl-metric-sub">Pattern recognition</span>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--line)', marginBottom: 100 }}></div>

            {/* DTS */}
            <div className="sl-solution-row sl-full-width reveal">
              <div className="sl-text-block" style={{ maxWidth: 800 }}>
                <div className="eyebrow">THERMAL PROFILING</div>
                <h3>Distributed Temperature Sensing (DTS)</h3>
                <p>Proactive thermal risk detection for high-voltage power cables, utility tunnels, and chemical pipelines. DTS provides continuous temperature profiles, identifying hot spots before they lead to catastrophic equipment failure or outages.</p>
                <div className="sl-use-case" style={{ maxWidth: 600 }}>
                  <strong>Key Outcome:</strong> SIL-2 compliant fire detection and real-time thermal rating for power transmission lines.
                </div>
              </div>
              <div className="sl-metrics-row">
                <div className="sl-metric-card">
                  <span className="sl-metric-val">±1°C</span>
                  <span className="sl-metric-label">Sensitivity</span>
                  <span className="sl-metric-sub">High-precision sensing</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">&lt;10s</span>
                  <span className="sl-metric-label">Scan Time</span>
                  <span className="sl-metric-sub">Rapid refresh rate</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">16 ch</span>
                  <span className="sl-metric-label">Capacity</span>
                  <span className="sl-metric-sub">Multi-zone monitoring</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">24/7</span>
                  <span className="sl-metric-label">Operation</span>
                  <span className="sl-metric-sub">Uninterrupted uptime</span>
                </div>
              </div>
              <div style={{ marginTop: 32 }}>
                <Link to="/contact?inquiry=DTS" className="sl-hero-link">Review Thermal Performance Data →</Link>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--line)', marginBottom: 100 }}></div>

            {/* MONITORING */}
            <div className="sl-solution-row sl-split-1-1 reveal">
              <div className="sl-text-block">
                <div className="eyebrow">SURVIVABILITY</div>
                <h3>Fiber Link Monitoring & Rerouting</h3>
                <p>Maintain continuous corridor visibility and prevent service downtime. Our automated monitoring suite combines live OTDR analytics with high-speed optical switching to detect cable cuts and micro-bends in under 10ms.</p>
                <ul className="sl-feat-list" style={{ marginTop: -12, marginBottom: 32 }}>
                  <li className="sl-feat-item">Automated fault localization via live GIS mapping</li>
                  <li className="sl-feat-item">Event-triggered optical path rerouting</li>
                </ul>
                <Link to="/contact?inquiry=Monitoring" className="btn btn-outline" style={{ padding: '14px 28px' }}>Inquire About System Deployment</Link>
              </div>
              <div className="sl-metrics-grid">
                <div className="sl-metric-card" style={{ background: '#F8FAFC' }}>
                  <span className="sl-metric-val">&lt;10ms</span>
                  <span className="sl-metric-label">Switch Latency</span>
                  <span className="sl-metric-sub">Rapid restoration</span>
                </div>
                <div className="sl-metric-card" style={{ background: '#F8FAFC' }}>
                  <span className="sl-metric-val">OTDR</span>
                  <span className="sl-metric-label">Diagnostics</span>
                  <span className="sl-metric-sub">Real-time trace data</span>
                </div>
                <div className="sl-metric-card" style={{ background: '#F8FAFC' }}>
                  <span className="sl-metric-val">SCADA</span>
                  <span className="sl-metric-label">Integration</span>
                  <span className="sl-metric-sub">Ready for NMS/NOC</span>
                </div>
                <div className="sl-metric-card" style={{ background: '#F8FAFC' }}>
                  <span className="sl-metric-val">GIS</span>
                  <span className="sl-metric-label">Mapping</span>
                  <span className="sl-metric-sub">Live fault overlays</span>
                </div>
              </div>
            </div>

            {/* Industry anchor targets for footer hash links */}
            <div id="telecom" style={{ scrollMarginTop: 120 }} />
            <div id="defence" style={{ scrollMarginTop: 120 }} />
            <div id="datacentre" style={{ scrollMarginTop: 120 }} />
            <div id="datacenter" style={{ scrollMarginTop: 120 }} />
            <div id="5g" style={{ scrollMarginTop: 120 }} />
            <div id="metro" style={{ scrollMarginTop: 120 }} />
            <div id="power" style={{ scrollMarginTop: 120 }} />
            <div id="utilities" style={{ scrollMarginTop: 120 }} />
            <div id="ftth" style={{ scrollMarginTop: 120 }} />
            <div id="broadcast" style={{ scrollMarginTop: 120 }} />
            <div id="enterprise" style={{ scrollMarginTop: 120 }} />
            <div id="industries" style={{ scrollMarginTop: 120 }} />
          </div>
        </section>


        {/* CTA */}
        <section className="section" style={{ paddingTop: 20, paddingBottom: 120 }}>
          <div className="container">
            <div style={{ background: '#FFFFFF', border: '1px solid var(--line)', padding: '80px 40px', textAlign: 'center', maxWidth: 960, margin: '0 auto', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--rad)' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>ENGINEERING CONSULTATION</div>
              <h2 style={{ color: '#07008F' }}>Technical feasibility and infrastructure planning.</h2>
              <p style={{ fontSize: 18, color: '#475569', margin: '16px auto 40px', maxWidth: 720 }}>We work alongside lead contractors and network architects to provide BOM validation, feasibility mapping, and custom assembly specifications for critical infrastructure deployments.</p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link className="sl-hero-btn" to="/contact?inquiry=Engineering+Consultation">Consult with our Team →</Link>
                <a className="btn btn-outline" href="https://wa.me/918419916460?text=Hi, I would like to discuss a technical infrastructure project." target="_blank" rel="noopener noreferrer" style={{ padding: '16px 28px' }}>Technical Inquiry (WhatsApp)</a>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
