import Seo from '../components/Seo';
import '../styles/solutions.css';

export default function Solutions() {
  return (
    <>
      <Seo
        title="Enterprise Solutions | Smart Fiber Optic Infrastructure — PDR World"
        description="Custom-engineered fiber optic solutions for DAS, DTS, fiber monitoring, and FTTH. Field-proven infrastructure for telecom operators, data centres, and industrial utilities."
        canonical="https://pdrworld.com/solutions"
      />
      <main>
        {/* HERO */}
        <section className="sl-hero reveal">
          <div className="container">
            <div className="sl-hero-inner">
              <div className="eyebrow">PDR INFRASTRUCTURE SYSTEMS</div>
              <h1>Field-proven fiber networks for operational reliability.</h1>
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
                <a href="/contact?inquiry=DAS" className="sl-hero-btn" style={{ padding: '14px 28px' }}>Request Engineering Specs</a>
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
                <a href="/contact?inquiry=DTS" className="sl-hero-link">Review Thermal Performance Data →</a>
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
                <a href="/contact?inquiry=Monitoring" className="btn btn-outline" style={{ padding: '14px 28px' }}>Inquire About System Deployment</a>
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
          </div>
        </section>

        {/* INDUSTRIAL APPLICATIONS */}
        <section className="section sec-muted" id="industries">
          <div className="container">
            <div className="sl-ind-layout">
              <div className="sl-ind-intro reveal">
                <div className="eyebrow">SECTOR READINESS</div>
                <h2 style={{ fontSize: 40, marginBottom: 24 }}>Industrial Applications & Deployment.</h2>
                <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.6, marginBottom: 40 }}>We deliver mission-critical fiber infrastructure for high-scale long-haul routes, tactical defence networks, and dense hyperscale compute environments.</p>

                <div className="sl-ind-credentials">
                  <div className="sl-cred-item">
                    <div className="sl-cred-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                    <div className="sl-cred-text">40+ Years Deployment Experience</div>
                  </div>
                  <div className="sl-cred-item">
                    <div className="sl-cred-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/></svg></div>
                    <div className="sl-cred-text">Engineered & Made in Mumbai</div>
                  </div>
                  <div className="sl-cred-item">
                    <div className="sl-cred-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
                    <div className="sl-cred-text">Rapid Project Dispatch Support</div>
                  </div>
                </div>
              </div>

              <div className="sl-app-grid">
                {/* Telecom */}
                <div className="sl-app-card reveal">
                  <h4>Telecom & Backbones</h4>
                  <p>High-density fiber management for national long-haul routes and 5G fronthaul. Scalable ODF and WDM systems optimized for metro aggregation.</p>
                  <div className="sl-app-chips">
                    <span className="sl-app-chip">5G Ready</span>
                    <span className="sl-app-chip">ODF Systems</span>
                    <span className="sl-app-chip">WDM Scale</span>
                  </div>
                  <div className="sl-app-trust">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Tier-1 Operator Compliant
                  </div>
                </div>

                {/* Energy */}
                <div className="sl-app-card reveal">
                  <h4>Energy & Utilities</h4>
                  <p>OPGW hardware and corridor sensing for power grids and substations. Real-time thermal profiling for high-voltage cable runs.</p>
                  <div className="sl-app-chips">
                    <span className="sl-app-chip">OPGW Hardware</span>
                    <span className="sl-app-chip">Grid Integrity</span>
                    <span className="sl-app-chip">Pipeline Safe</span>
                  </div>
                  <div className="sl-app-trust">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Critical Infrastructure Rated
                  </div>
                </div>

                {/* Defence */}
                <div className="sl-app-card reveal">
                  <h4>Defence & Secure Gov</h4>
                  <p>Ruggedized tactical assemblies and secure distribution frames for mission-critical field deployments and tactical communications.</p>
                  <div className="sl-app-chips">
                    <span className="sl-app-chip">Tactical Fiber</span>
                    <span className="sl-app-chip">Ruggedized</span>
                    <span className="sl-app-chip">Secure ODF</span>
                  </div>
                  <div className="sl-app-trust">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Mil-Spec Availability
                  </div>
                </div>

                {/* Rail */}
                <div className="sl-app-card reveal">
                  <h4>Rail & Urban Transit</h4>
                  <p>Communication-based signaling (CBTC) and passenger info networks. Trackside fiber monitoring for rail integrity and acoustic wheel sensing.</p>
                  <div className="sl-app-chips">
                    <span className="sl-app-chip">CBTC Networks</span>
                    <span className="sl-app-chip">Signaling</span>
                    <span className="sl-app-chip">Acoustic Sensing</span>
                  </div>
                  <div className="sl-app-trust">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Mass Transit Certified
                  </div>
                </div>

                {/* Data Centres */}
                <div className="sl-app-card reveal">
                  <h4>Hyperscale Data Centres</h4>
                  <p>Ultra-dense MTP/MPO interconnects and modular patch panels optimized for hyperscale cooling and high-speed compute density.</p>
                  <div className="sl-app-chips">
                    <span className="sl-app-chip">MTP/MPO</span>
                    <span className="sl-app-chip">High Density</span>
                    <span className="sl-app-chip">Ultra-Low Loss</span>
                  </div>
                  <div className="sl-app-trust">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Hyperscale Ready
                  </div>
                </div>

                {/* Custom OEM */}
                <div className="sl-app-card reveal" style={{ background: '#F8FAFC', borderStyle: 'dashed' }}>
                  <h4>Custom OEM Engineering</h4>
                  <p>End-to-end bespoke assembly design and large-scale manufacturing support for global technology partners and research labs.</p>
                  <div className="sl-app-chips">
                    <span className="sl-app-chip">Custom BOM</span>
                    <span className="sl-app-chip">Rapid Prototype</span>
                    <span className="sl-app-chip">OEM Scale</span>
                  </div>
                  <div className="sl-app-trust">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Bespoke Solutions
                  </div>
                </div>
              </div>
            </div>
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
                <a className="sl-hero-btn" href="/contact?inquiry=Engineering+Consultation">Consult with our Team →</a>
                <a className="btn btn-outline" href="https://wa.me/918419916460?text=Hi, I would like to discuss a technical infrastructure project." target="_blank" rel="noopener noreferrer" style={{ padding: '16px 28px' }}>Technical Inquiry (WhatsApp)</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
