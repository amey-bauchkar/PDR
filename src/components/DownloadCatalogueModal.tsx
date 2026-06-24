import { useState, useRef } from 'react';
import './DownloadCatalogueModal.css';

const CATALOGUE_PATH = '/files/PDR-Catalogue-2024.pdf';

interface DownloadCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadCatalogueModal({ isOpen, onClose }: DownloadCatalogueModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  if (!isOpen) return null;

  /** Trigger download via a hidden anchor — works reliably without pop-up blockers */
  const triggerDownload = () => {
    if (downloadRef.current) {
      downloadRef.current.click();
    } else {
      // Fallback: create a temporary anchor
      const a = document.createElement('a');
      a.href = CATALOGUE_PATH;
      a.download = 'PDR-Catalogue-2024.pdf';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);
    setSubmitting(true);

    const object = Object.fromEntries(fd as any);
    const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;

    // Always trigger download — lead capture is best-effort
    const doDownload = () => {
      triggerDownload();
      setSubmitted(true);
      setSubmitting(false);
    };

    // If no access key configured, skip API call but still download
    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
      console.warn('[DownloadCatalogue] VITE_WEB3FORMS_KEY not configured — skipping lead capture');
      doDownload();
      return;
    }

    object.access_key = accessKey;
    object.subject = `Catalogue Download Request from ${object.name}`;
    object.from_name = object.name;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(object),
      });

      if (!res.ok) {
        console.warn('[DownloadCatalogue] Web3Forms returned', res.status);
      }
    } catch (error) {
      console.error('[DownloadCatalogue] Lead capture failed:', error);
    }

    // Download regardless of whether lead capture succeeded
    doDownload();
  };

  return (
    <div className="dc-modal-overlay" onClick={onClose}>
      <div className="dc-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="dc-modal-close" onClick={onClose}>
          &times;
        </button>

        {/* Hidden anchor for reliable download — avoids pop-up blockers */}
        <a
          ref={downloadRef}
          href={CATALOGUE_PATH}
          download="PDR-Catalogue-2024.pdf"
          style={{ display: 'none' }}
          aria-hidden="true"
          tabIndex={-1}
        >
          download
        </a>

        {submitted ? (
          <div className="dc-modal-success">
            <h3>Thank You!</h3>
            <p>
              Your catalogue download should have started. If it didn't,{' '}
              <a href={CATALOGUE_PATH} download="PDR-Catalogue-2024.pdf">
                click here to download
              </a>.
            </p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <h2>Download PDR Catalogue</h2>
            <p className="dc-modal-desc">Please provide your details to access our comprehensive product catalogue.</p>
            <form onSubmit={handleSubmit} className="dc-modal-form">
              <div className="dc-form-group">
                <label htmlFor="dc-name">Full Name *</label>
                <input type="text" id="dc-name" name="name" required />
              </div>
              <div className="dc-form-group">
                <label htmlFor="dc-email">Work Email *</label>
                <input type="email" id="dc-email" name="email" required />
              </div>
              <div className="dc-form-group">
                <label htmlFor="dc-country">Country *</label>
                <input type="text" id="dc-country" name="country" required />
              </div>
              <button type="submit" className="btn btn-primary dc-submit-btn" disabled={submitting}>
                {submitting ? 'Processing...' : 'Download Now'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
