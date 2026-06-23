import { useState } from 'react';
import './DownloadCatalogueModal.css';

interface DownloadCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadCatalogueModal({ isOpen, onClose }: DownloadCatalogueModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);
    setSubmitting(true);

    const object = Object.fromEntries(fd as any);
    object.access_key = import.meta.env.VITE_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE";
    object.subject = `Catalogue Download Request from ${object.name}`;
    object.from_name = object.name;

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(object)
      });
      // Always trigger download
      window.open('/files/PDR-Catalogue-2024.pdf', '_blank');
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit form', error);
      // Still let them download
      window.open('/files/PDR-Catalogue-2024.pdf', '_blank');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dc-modal-overlay" onClick={onClose}>
      <div className="dc-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="dc-modal-close" onClick={onClose}>
          &times;
        </button>
        {submitted ? (
          <div className="dc-modal-success">
            <h3>Thank You!</h3>
            <p>Your catalogue download should have started. If it didn't, <a href="/files/PDR-Catalogue-2024.pdf" target="_blank" rel="noopener noreferrer">click here</a>.</p>
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
