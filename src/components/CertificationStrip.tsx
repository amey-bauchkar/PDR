import React from 'react';

const badges = [
  "ISO 9001:2015",
  "ISO 14001:2015",
  "RoHS",
  "IEC",
  "CACT",
  "Made in India",
  "GeM"
];

export default function CertificationStrip() {
  return (
    <div style={{
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
      padding: '12px 0',
      width: '100%',
      overflow: 'hidden'
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          color: '#475569',
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {badges.map((badge, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
