import React from 'react';

const badges = [
  { name: "ISO 9001:2015", src: "/images/certi/iso-9001.png" },
  { name: "ISO 14001:2015", src: "/images/certi/iso-14001.png" },
  { name: "RoHS", src: "/images/certi/rohs.png" },
  { name: "IEC", src: "/images/certi/iec.svg" },
  { name: "CACT", src: "/images/certi/cact.jpeg" },
  { name: "Made in India", src: "/images/certi/made-in-india.webp" },
  { name: "GeM", src: "/images/certi/gem.png" }
];

const BadgeItem = ({ badge }: { badge: { name: string, src: string } }) => {
  const [imgError, setImgError] = React.useState(false);

  if (imgError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        {badge.name}
      </div>
    );
  }

  return (
    <img 
      src={badge.src} 
      alt={badge.name}
      title={badge.name}
      style={{ 
        height: '32px', 
        objectFit: 'contain', 
        transition: 'all 0.3s ease',
        cursor: 'default'
      }}
      onError={() => setImgError(true)}
    />
  );
};

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
          gap: '32px',
          color: '#475569',
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {badges.map((badge, index) => (
            <BadgeItem key={index} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
}
