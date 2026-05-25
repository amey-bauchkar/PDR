import { useState, useEffect } from 'react';
import { useRfqCart } from './RfqCartProvider';
import { getFallbackImage } from '../lib/imageResolution';
import productsData from '../data/products.json';
import { mergeWithProducts } from '../lib/productSync';

export default function RfqCartWidget() {
  const { items, isOpen, removeItem, updateQty, open, close, submit } = useRfqCart();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const total = items.reduce((s, i) => s + i.qty, 0);
  const [products, setProducts] = useState(() => mergeWithProducts(productsData));

  useEffect(() => {
    const handleStorage = () => setProducts(mergeWithProducts(productsData));
    window.addEventListener('storage', handleStorage);
    window.addEventListener('pdrworld-product-update', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pdrworld-product-update', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setStep(1), 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const fd = new FormData(formElement);
    setSubmitting(true);

    try {
      await submit({
        name: String(fd.get('name') ?? ''),
        email: String(fd.get('email') ?? ''),
        company: String(fd.get('company') ?? ''),
        notes: String(fd.get('notes') ?? ''),
      });
      formElement.reset();
      alert('Thank you! Your quote request has been securely submitted.');
      close();
    } catch (error: any) {
      console.error('Failed to submit quote request', error);
      alert(`We could not submit the quote request right now. Error: ${error?.message || error}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {total > 0 && (
        <div
          className="rfq-cart-widget"
          onClick={open}
          style={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            background: 'var(--accent)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: 99,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 12px 32px -8px rgba(2,132,199,0.5)',
            zIndex: 9998,
            transition: 'all 0.3s',
            fontWeight: 700,
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span>Quote Cart</span>
          <div className="badge">{total}</div>
        </div>
      )}

      <div className={`rfq-backdrop${isOpen ? ' open' : ''}`} onClick={close} />

      <div className={`rfq-drawer${isOpen ? ' open' : ''}`}>
        <div className="rfq-header">
          <div>
            <h2>{step === 1 ? 'Your Quote Cart' : 'Request Details'}</h2>
            <p className="rfq-header-sub">
              {step === 1 ? 'Review your selected items below.' : 'Share your specs and our engineering team responds within 24 hours.'}
            </p>
          </div>
          <button className="rfq-close" onClick={close} aria-label="Close">
            ×
          </button>
        </div>
        <div className="rfq-body">
          {step === 1 ? (
            items.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>Your cart is empty.</p>
            ) : (
              items.map((item, idx) => {
                let displayImage = item.image;
                if (item.image === '/placeholder.webp') {
                  const matchedProduct = products.find(p => p.name === item.title);
                  if (matchedProduct && matchedProduct.imageUrl) {
                    displayImage = matchedProduct.imageUrl;
                  }
                }
                return (
                <div key={`${item.title}-${item.specs}`} className="rfq-item">
                  <img
                    src={displayImage}
                    className="rfq-item-img"
                    alt={item.title}
                    onError={(e) => {
                      const fallback = getFallbackImage();
                      if (!(e.currentTarget as HTMLImageElement).src.endsWith(fallback)) {
                        (e.currentTarget as HTMLImageElement).src = fallback;
                      }
                    }}
                  />
                  <div className="rfq-item-info">
                    <h4>{item.title}</h4>
                    <p>{item.specs}</p>
                    <div className="rfq-item-actions">
                      <div className="rfq-qty">
                        <button onClick={() => updateQty(idx, -1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(idx, 1)}>+</button>
                      </div>
                      <button className="rfq-remove" onClick={() => removeItem(idx)}>Remove</button>
                    </div>
                  </div>
                </div>
                );
              })
            )
          ) : (
            <div className="rfq-step2">
              <div className="rfq-summary" style={{ background: 'var(--surface-2)', padding: 16, borderRadius: 12, border: '1px solid var(--line)', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: 14 }}>Selected Products ({total})</h4>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Edit Cart</button>
                </div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '8px 0' }}>
                  {items.map((item, idx) => {
                     let displayImage = item.image;
                     if (item.image === '/placeholder.webp') {
                       const matchedProduct = products.find(p => p.name === item.title);
                       if (matchedProduct && matchedProduct.imageUrl) {
                         displayImage = matchedProduct.imageUrl;
                       }
                     }
                     return (
                     <div key={idx} style={{ position: 'relative', flexShrink: 0, width: 48, height: 48, background: '#fff', borderRadius: 6, border: '1px solid var(--line)', padding: 4 }} title={`${item.qty}x ${item.title}`}>
                        <img
                          src={displayImage}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            const fallback = getFallbackImage();
                            if (!(e.currentTarget as HTMLImageElement).src.endsWith(fallback)) {
                              (e.currentTarget as HTMLImageElement).src = fallback;
                            }
                          }}
                        />
                        <div style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 'bold', padding: '2px 6px', borderRadius: 99, boxShadow: '0 2px 4px rgba(0,0,0,0.15)', zIndex: 2 }}>{item.qty}</div>
                     </div>
                     );
                  })}
                </div>
              </div>
              <form id="rfq-form" className="rfq-form" onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: 8, fontSize: 18 }}>Your Information</h3>
                <p style={{ marginBottom: 16, fontSize: 14, color: 'var(--muted)' }}>Submit your project details and we will send a tailored proposal.</p>
                <input type="text" name="name" placeholder="Full Name" required />
                <input type="email" name="email" placeholder="Work Email" required />
                <input type="text" name="company" placeholder="Company Name" required />
                <textarea name="notes" placeholder="Additional Requirements (Lengths, Connectors, etc.)" rows={3} />
              </form>
            </div>
          )}
        </div>
        <div className="rfq-footer">
          {step === 1 ? (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={items.length === 0} onClick={() => setStep(2)}>
              Proceed to Request Quote
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" className="btn" style={{ flex: '0 0 auto', background: '#fff', border: '1px solid var(--line)' }} onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" form="rfq-form" className="btn btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
