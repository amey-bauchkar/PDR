import { useState } from 'react';
import { useRfqCart } from './RfqCartProvider';

export default function RfqCartWidget() {
  const { items, isOpen, removeItem, updateQty, open, close, submit } = useRfqCart();
  const [submitting, setSubmitting] = useState(false);
  const total = items.reduce((s, i) => s + i.qty, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    await submit({
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      company: String(fd.get('company') ?? ''),
      notes: String(fd.get('notes') ?? ''),
    });
    setSubmitting(false);
    e.currentTarget.reset();
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
          <h2>Your Quote Request</h2>
          <button className="rfq-close" onClick={close} aria-label="Close">
            ×
          </button>
        </div>
        <div className="rfq-body">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>Your cart is empty.</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="rfq-item">
                <img
                  src={item.image}
                  className="rfq-item-img"
                  alt={item.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/fiber-patchcord.png';
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
            ))
          )}
        </div>
        <div className="rfq-footer">
          <form className="rfq-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Full Name" required />
            <input type="email" name="email" placeholder="Work Email" required />
            <input type="text" name="company" placeholder="Company Name" required />
            <textarea name="notes" placeholder="Additional Requirements (Lengths, Connectors, etc.)" rows={3} />
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? 'Submitting...' : 'Submit Request for Quote'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
