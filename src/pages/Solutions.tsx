import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { BreadcrumbSchema, ServiceSchema } from '../components/Schema';
import '../styles/solutions.css';

export default function Solutions() {
  return (
    <>
      <Seo
        title="Fiber Optic Infrastructure Solutions | Remote Fiber Monitoring, DAS & DTS — PDR"
        description="Custom-engineered fiber optic infrastructure: remote fiber monitoring with automated rerouting, plus Distributed Acoustic Sensing and Distributed Temperature Sensing. Field-proven for telecom, defence, and utilities."
        canonical="https://pdr-sable.vercel.app/solutions"
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://pdr-sable.vercel.app/' },
        { name: 'Solutions', url: 'https://pdr-sable.vercel.app/solutions' },
      ]} />
      <ServiceSchema 
        name="Fiber Optic Infrastructure Solutions"
        description="Custom-engineered fiber optic infrastructure: remote fiber monitoring with automated rerouting, plus Distributed Acoustic Sensing and Distributed Temperature Sensing. Field-proven for telecom, defence, and utilities."
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
              </div>
            </div>
          </div>
        </section>

        {/* SENSING & MONITORING */}
        <section className="section reveal" id="sensing" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="sl-section-head">
              <div className="eyebrow">MONITORING SYSTEMS</div>
              <h2>Remote fiber monitoring and distributed sensing.</h2>
              <p>We convert existing fiber optic infrastructure into a continuous, high-fidelity sensing instrument for link integrity, structural health, and operational visibility.</p>
            </div>

            {/* REMOTE FIBER MONITORING — primary */}
            <div className="sl-solution-row sl-split-1-1 reveal">
              <div className="sl-text-block">
                <div className="eyebrow">SURVIVABILITY</div>
                <h3>Remote Fiber Monitoring</h3>
                <p>Maintain continuous corridor visibility and prevent service downtime. Our automated monitoring suite combines live OTDR analytics with high-speed optical switching to detect cable cuts and micro-bends in under 10ms — then localizes and reroutes around the fault automatically.</p>
                <ul className="sl-feat-list" style={{ marginTop: -12, marginBottom: 32 }}>
                  <li className="sl-feat-item">Automated fault localization via live GIS mapping</li>
                  <li className="sl-feat-item">Event-triggered optical path rerouting</li>
                  <li className="sl-feat-item">SCADA / NMS / NOC integration out of the box</li>
                </ul>
                <Link to="/contact?inquiry=Remote+Fiber+Monitoring" className="sl-hero-btn" style={{ padding: '14px 28px' }}>Inquire About System Deployment</Link>
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

            <div style={{ height: 1, background: 'var(--line)', margin: '56px 0' }}></div>

            {/* DAS — secondary, minimal */}
            <div className="sl-solution-row sl-split-2-1 reveal">
              <div className="sl-text-block">
                <div className="eyebrow">ACOUSTIC DETECTION</div>
                <h3>Distributed Acoustic Sensing (DAS)</h3>
                <p>Convert installed fiber routes into a continuous acoustic detection layer for perimeter security, leak monitoring, and intrusion alerts — with AI/ML classification along 50km+ corridors.</p>
                <Link to="/contact?inquiry=DAS" className="sl-hero-link">Request DAS Specs →</Link>
              </div>
              <div className="sl-metrics-row">
                <div className="sl-metric-card">
                  <span className="sl-metric-val">50km+</span>
                  <span className="sl-metric-label">Range per channel</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">±5m</span>
                  <span className="sl-metric-label">Spatial Resolution</span>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--line)', margin: '56px 0' }}></div>

            {/* DTS — secondary, minimal */}
            <div className="sl-solution-row sl-split-2-1 reveal" style={{ marginBottom: 0 }}>
              <div className="sl-text-block">
                <div className="eyebrow">THERMAL PROFILING</div>
                <h3>Distributed Temperature Sensing (DTS)</h3>
                <p>Proactive thermal risk detection for high-voltage power cables, utility tunnels, and pipelines — continuous temperature profiles that flag hot spots before failure.</p>
                <Link to="/contact?inquiry=DTS" className="sl-hero-link">Review Thermal Data →</Link>
              </div>
              <div className="sl-metrics-row">
                <div className="sl-metric-card">
                  <span className="sl-metric-val">±1°C</span>
                  <span className="sl-metric-label">Sensitivity</span>
                </div>
                <div className="sl-metric-card">
                  <span className="sl-metric-val">&lt;10s</span>
                  <span className="sl-metric-label">Scan Time</span>
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
        <section className="section" style={{ paddingTop: 0, paddingBottom: 120 }}>
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
