import { useState, useEffect } from 'react';

const injectScripts = () => {
  if (document.getElementById('ga4-script')) return;

  const gaScript = document.createElement('script');
  gaScript.id = 'ga4-script';
  gaScript.async = true;
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-PE23NMN0VP';
  document.head.appendChild(gaScript);

  const gaInline = document.createElement('script');
  gaInline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-PE23NMN0VP');
  `;
  document.head.appendChild(gaInline);

  const liInline = document.createElement('script');
  liInline.innerHTML = `
    _linkedin_partner_id = "9550212";
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(_linkedin_partner_id);
    (function(l) {
    if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
    window.lintrk.q=[]}
    var s = document.getElementsByTagName("script")[0];
    var b = document.createElement("script");
    b.type = "text/javascript";b.async = true;
    b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    s.parentNode.insertBefore(b, s);})(window.lintrk);
  `;
  document.head.appendChild(liInline);

  const clarityInline = document.createElement('script');
  clarityInline.innerHTML = `
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "xbg2tpfr42");
  `;
  document.head.appendChild(clarityInline);
};

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('pdr-cookie-consent');
    if (!consent) {
      setShow(true);
    } else if (consent === 'true') {
      injectScripts();
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      padding: '16px 24px',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 99999,
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <p style={{ margin: 0, fontSize: '14px', color: '#475569', flex: '1 1 300px' }}>
        We use cookies to enhance your experience, analyze site traffic, and serve targeted advertisements. 
        By continuing to visit this site you agree to our use of cookies.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => {
            localStorage.setItem('pdr-cookie-consent', 'true');
            setShow(false);
            injectScripts();
          }}
          style={{
            background: '#07008F',
            color: 'white',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
